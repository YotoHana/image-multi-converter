//import './style.css';
import './app.css';
import { FileDialog } from "../wailsjs/go/main/App"
import { GetSizeMB } from "../wailsjs/go/main/App"
import { Convert } from "../wailsjs/go/main/App"

let paths: string[]
const qualitySlider = document.getElementById('qualitySlider') as HTMLInputElement;
const qualityVal = document.getElementById('qualityVal');
const fileList = document.getElementById('fileList') as HTMLUListElement;

if (qualitySlider && qualityVal) {
    qualityVal.textContent = qualitySlider.value;

    qualitySlider.addEventListener('input', () => {
        qualityVal.textContent = qualitySlider.value;
    });
}

const perfTypes = ['Минимум', 'Средняя', 'Высокая', 'Максимум'];
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

function clearList(fileList: HTMLUListElement) {
    while (fileList.firstChild) {
        fileList.removeChild(fileList.firstChild)
        }
}

document.addEventListener('DOMContentLoaded', () => {
    
    const fileButton = document.getElementById('fileButton');

    if (fileButton) {
        fileButton.addEventListener('click', async () => {

            clearList(fileList);

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

                if (fileList) {
                    const fileItems = filePaths.map((path: string | null) => {
                        const li = document.createElement("li");
                        li.textContent = path;
                        return li;
                    });

                    fileItems.forEach((li: any) => fileList.appendChild(li));
                }
            } else {
                if (fileList) {
                    const listTextNone = document.createElement('h1');
                    listTextNone.textContent = 'ВЫ НИЧЕГО НЕ ВЫБРАЛИ';
                    fileList.appendChild(listTextNone);
                }
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
            const convert = await Convert(quality, performance, false, paths, false);

            if (convert) {
                clearList(fileList);
                if (fileList) {
                    const listTextDone = document.createElement('h1');
                    const listDescription = document.createElement('h5');
                    listTextDone.textContent = 'КОНВЕРТАЦИЯ УСПЕШНА';
                    listDescription.textContent = 'Готовые изображения вы можете найти в папке \"output\"';
                    fileList.appendChild(listTextDone);
                    fileList.appendChild(listDescription);
                }
            }
        });
    }

});
