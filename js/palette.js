function rgb2hex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function hex2rgb(hex) {
    var bigint = parseInt(hex, 16);
    var r = (bigint >> 16) & 255;
    var g = (bigint >> 8) & 255;
    var b = bigint & 255;

    return [r, g, b];
}

function rgb2html(r, g, b) {
    r = Math.floor(r);
    g = Math.floor(g);
    b = Math.floor(b);
    return "rgb(" + r + "," + g + "," + b + ")";
}

const DEF_BASE_COLORS = [
    [143,111,35],
    [139,139,203],
    [107,107,15],
    [127,0,0],
    [175,103,35],
    [255,243,27],
    [227,179,151],
    [171,139,163],
    [187,115,159],
    [219,195,187],
    [111,131,123],
    [255,0,0],
    [0,0,255],
    [247,211,139],
    [215,255,255]
];

let baseColors = [
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0]
];

// 256 цветов
let palette = [];

/** получить базовые цвета из кнопок */
function getBaseColors() {
    for (let i = 1; i < 16; ++i) {
        let btnColor = document.getElementById("btn_color_" + i);
        let hexColor = btnColor.value.slice(1);
        let color = hex2rgb(hexColor);
        baseColors[i - 1] = color;
    }
}

/** сгенерировать массив PALETTE */
function generatePalette() {
    // нулевой цвет используется как прозрачность. Для удобства шлёпнем магенту
    palette[0] = [255, 0, 255];      // transparent color

    // 1-15 всегда градация чисто белого в чисто черный
    palette[1]  = [0, 0, 0];
    palette[15] = [0xFF, 0xFF, 0xFF];
    let c = 255 / 15.0;
    for (let i = 2; i < 15; ++i) {
        let val = i * c;
        palette[i] = [val, val, val];
    }

    // теперь формируем градиенты заданных цветов
    let delim = 1.0 / 17.0;
    for (let i = 0; i < baseColors.length; ++i) {
        // разбиваем на шаг градиента. Так-то на 16 надо делить, но тогда у всех цветов нулевым окажется черный
        // !!!15 черных одинаковых цветов никому не надо!!! поэтому я делю на 17, но собираю цвет в промежутке 1-17 (итого 16 градаций)
        // в первом ряду делю на 15, т.к. один цвет уйдёт на прозрачность, а крайним хочу четко черный.
        // у первого ряда нет сдвига, честные 15 градаций
        let baseColor = baseColors[i];
        let rc = baseColor[0] * delim,
            gc = baseColor[1] * delim,
            bc = baseColor[2] * delim;

        let yOffset = (i + 1) << 4;

        palette[15 + yOffset] = baseColor;
        for (let j = 0; j < 15; ++j) {
            palette[j + yOffset] = [
                rc * (j + 2),
                gc * (j + 2),
                bc * (j + 2)
            ];
        }
    }
}

/** отобразить таблицу-палитру */
function drawPalette() {
    for (let r = 0; r < 16; ++r) {
        let offset = r << 4;
        for (let c = 0; c < 16; ++c) {
            let color = palette[offset + c]
            let cellName = ["cell", r, c].join("_");
            let cell = document.getElementById(cellName);

            cell.style.backgroundColor = rgb2html(color[0], color[1], color[2]);
        }
    }
}

/** функция сохранения бинарных данных */
function saveByteArray(data, name) {
    const blob = new Blob(data, {type: "application/octet-stream"}),
          url  = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
};

function loadPalette() {
    let file = document.getElementById('file_input').files[0];

    alert("File Name - " + file.name + "\nFile Size - " + file.size + "\nFile Type - " + file.type);
}

function savePalette() {
    // 4 б - хэдер
    // 3 б - rgb
    // 256 цветов в палитре
    const bytes = new Uint8Array(256 * 3 + 4);

    bytes[0] = 's'.charCodeAt(); // swinger
    bytes[1] = 'e'.charCodeAt(); // engine
    bytes[2] = 'P'.charCodeAt(); // Palette
    bytes[3] = 1; // v1


    for (let r = 0; r < 16; ++r) {
        let offset = r << 4;
        for (let c = 0; c < 16; ++c) {
            let color = palette[offset + c];
            let byteOffset = offset * 3 + c * 3;

            for (let b = 0; b < 3; ++b) {
                bytes[byteOffset + b] = color[b];
            }
        }
    }

    saveByteArray([bytes], "palette.sep");
}
