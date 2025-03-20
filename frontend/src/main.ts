import './style.css';
import './app.css';
import { FileDialog } from "../wailsjs/go/main/App"
import { GetSizeMB } from "../wailsjs/go/main/App"
import { Convert } from "../wailsjs/go/main/App"

let paths: string[]
const qualitySlider = document.getElementById('qualitySlider') as HTMLInputElement;
const qualityVal = document.getElementById('qualityVal');

if (qualitySlider && qualityVal) {
    qualityVal.textContent = qualitySlider.value;

    qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = qualitySlider.value;
    });
}

const perfTypes = ['Минимальная', 'Средняя', 'Высокая', 'Максимальная'];
const perfSlider = document.getElementById('perfSlider') as HTMLInputElement;
const perfVal = document.getElementById('perfVal');
const sliderVal = parseInt(perfSlider.value, 10) - 1;

if (perfSlider && perfVal) {
    perfVal.textContent = perfTypes[sliderVal];

    perfSlider.addEventListener('input', () => {
        const sliderVal = parseInt(perfSlider.value, 10) - 1;
        perfVal.textContent = perfTypes[sliderVal];
    });
}

const perfSave = document.getElementById('perfSave') as HTMLInputElement;
let saveSettings = false;

if (perfSave.checked) {
    saveSettings = true;
} else {
    saveSettings = false;
}


document.addEventListener('DOMContentLoaded', () => {
    
    const fileButton = document.getElementById('fileButton');

    if (fileButton) {
        fileButton.addEventListener('click', async () => {

            const fileList = document.getElementById('fileList');

            if (fileList) {
                while (fileList.firstChild) {
                    fileList.removeChild(fileList.firstChild);
                }
            }

            const filePaths = await FileDialog();
            paths = filePaths

            if (filePaths) {

                const quality = parseInt(qualitySlider.value, 10);
                const performance = parseInt(perfSlider.value, 10);

                const convertTmp = await Convert(quality, performance, false, filePaths, true);
                if (convertTmp) {
                    const sizeMBConv = document.getElementById('sizeMBConv');
                    
                    if (sizeMBConv) {
                        sizeMBConv.textContent = convertTmp.toFixed(2).toString();
                    }
                }

                const fileList = document.getElementById('fileList');

                if (fileList) {
                    const fileItems = filePaths.map((path: string | null) => {
                        const li = document.createElement("li");
                        li.textContent = path;
                        return li;
                    });

                    fileItems.forEach((li: any) => fileList.appendChild(li));
                }
            } else {
                console.log("Вы ничего не выбрали")
                alert("Вы ничего не выбрали")
            }

            const fileSize = await GetSizeMB();

            if (fileSize) {
                const sizeMB = document.getElementById('sizeMB');

                if (sizeMB) {
                    sizeMB.textContent = fileSize.toFixed(2).toString();
                }
            }
        });
    }

    const convButton = document.getElementById('convButton');

    if (convButton) {
        convButton.addEventListener('click', async () => {

            const quality = parseInt(qualitySlider.value, 10)
            const performance = parseInt(perfSlider.value, 10)
            const convert = await Convert(quality, performance, saveSettings, paths, false);

            if (convert) {
                alert('Конвертация успешна!')
            }
        });
    }

});
