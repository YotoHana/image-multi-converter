package main

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"github.com/chai2010/webp"
	"github.com/disintegration/imaging"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var FilePaths []string
var wg sync.WaitGroup
var mu sync.Mutex

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) FileDialog() []string {
	FilePaths, _ = runtime.OpenMultipleFilesDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "Выберите файл",
		Filters: []runtime.FileFilter{
			{DisplayName: "Изображения", Pattern: "*.jpg;*.png"},
		},
	})
	return FilePaths
}

func (a *App) GetSizeMB() float64 {
	sizeBefore := 0.0
	for _, path := range FilePaths {
		fileInfo, _ := os.Stat(path)
		sizeBefore += float64(fileInfo.Size())
	}

	sizeBefore *= 0.000001
	return sizeBefore
}

func (a *App) Convert(quality int, performance int, saveSettings bool, filePaths []string, tmp bool) float64 {
	var maxWorkers int

	switch performance {
	case 1:
		maxWorkers = 2
	case 2:
		maxWorkers = 4
	case 3:
		maxWorkers = 6
	case 4:
		maxWorkers = 10
	default:
		maxWorkers = 6
	}

	workers := make(chan struct{}, maxWorkers)

	var sizeSum float64

	for _, v := range filePaths {
		wg.Add(1)
		go func(imgPath string) {
			defer wg.Done()
			workers <- struct{}{}
			size := workerConv(imgPath, quality, tmp)
			mu.Lock()
			sizeSum += float64(size)
			mu.Unlock()
			<- workers
		}(v)
	}
	wg.Wait()
	sizeSum *= 0.000001
	fmt.Println(sizeSum, " GO BACKEND SIZE")
	return sizeSum
}

func workerConv(path string, quality int, tmp bool) int64 {
	var buf bytes.Buffer

	outputPath := setOutput(path, tmp)
	file, _ := os.Open(path)
	//error!

	defer file.Close()

	img, _ := imaging.Decode(file)
	//error!

	err := webp.Encode(&buf, img, &webp.Options{Quality: float32(quality)})
	if err != nil {
		//err!
		fmt.Println(err)
	}

	err = os.WriteFile(outputPath, buf.Bytes(), 0666)
	if err != nil {
		//err!
		fmt.Println(err)
	}

	if tmp {
		fileInfo, _ := os.Stat(outputPath)
		//ERR
		size := fileInfo.Size()
		return size
	}
	 return 0
}

func setOutput(path string, tmp bool) string {
	var result string

	file := filepath.Base(path)
	ext := filepath.Ext(path)
	fileName := strings.TrimSuffix(file, ext)

	if !tmp {
		result = "./output/" + fileName + ".webp"
		return result
	}

	result = "./tmp/" + fileName + ".webp"
	return result
}