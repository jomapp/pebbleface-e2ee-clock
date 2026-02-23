import Poco from "commodetto/Poco";
import parseBMF from "commodetto/parseBMF";
import parseRLE from "commodetto/parseRLE";
import Message from "pebble/message";

// The "Encrypted" character set
const CIPHER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ+++$$$&&&***@@@###%%%===1234567890";

const render = new Poco(screen);

function getFont(name, size) {
    const font = parseBMF(new Resource(`${name}-${size}.fnt`));
    font.bitmap = parseRLE(new Resource(`${name}-${size}-alpha.bm4`));
    return font;
}

const timeFont = getFont("MajorMonoDisplay-Regular", 8);

const DEFAULT_SETTINGS = {
    backgroundColor: {r: 0, g: 0, b: 170},
    textColor: {r: 255, g: 255, b: 255},
    use24Hour: true,
    animateMinuteChange: true,
    animationSpeed: 150,
};

function loadSettings() {
    const stored = localStorage.getItem("settings");
    if (stored) {
        try {
            return {...DEFAULT_SETTINGS, ...JSON.parse(stored)};
        } catch (e) {
            console.log("Failed to parse settings");
        }
    }
    return {...DEFAULT_SETTINGS};
}

function saveSettings() {
    localStorage.setItem("settings", JSON.stringify(settings));
}

let settings = loadSettings();

let bgColor = render.makeColor(settings.backgroundColor.r, settings.backgroundColor.g, settings.backgroundColor.b);
let textColor = render.makeColor(settings.textColor.r, settings.textColor.g, settings.textColor.b);

function updateColors() {
    bgColor = render.makeColor(settings.backgroundColor.r, settings.backgroundColor.g, settings.backgroundColor.b);
    textColor = render.makeColor(settings.textColor.r, settings.textColor.g, settings.textColor.b);
}

// 6x10 Bitmap representation for digits 0-9
const DIGITS = [
    // 0
    [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1,
        1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0],
    // 1
    [0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0,
        0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1],
    // 2
    [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 0,
        0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
    // 3
    [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0,
        0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0],
    // 4
    [0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0,
        1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
    // 5
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1,
        0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0],
    // 6
    [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1,
        1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0],
    // 7
    [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0,
        0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0],
    // 8
    [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0,
        1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0],
    // 9
    [0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1,
        0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0]
];

function updateEncryptedBlock(screenBuffer, digit1, digit2) {
    const bitmap1 = digit1 !== null ? DIGITS[digit1] : null;
    const bitmap2 = digit2 !== null ? DIGITS[digit2] : null;
    const cipherLen = CIPHER_CHARS.length;

    for (let i = 0; i < 60; i++) {
        const row = Math.floor(i / 6);
        const colInDigit = i % 6;

        // Store a random index (0 to cipherLen-1) if pixel is active, else 255 for space
        if (digit1 !== null) {
            const idx1 = (row * COL_COUNT) + colInDigit;
            screenBuffer[idx1] = bitmap1[i] ? Math.floor(Math.random() * cipherLen) : 255;
        }

        if (digit2 !== null) {
            const idx2 = (row * COL_COUNT) + (colInDigit + 8);
            screenBuffer[idx2] = bitmap2[i] ? Math.floor(Math.random() * cipherLen) : 255;
        }

        // Space out the middle (255 is our "empty" flag)
        screenBuffer[(row * COL_COUNT) + 6] = 255;
        screenBuffer[(row * COL_COUNT) + 7] = 255;
    }
}

const ROW_COUNT = 10;
const COL_COUNT = 14; // (6 for digit1 + 2 spaces + 6 for digit2)
let screenBufferBlock = new Uint8Array(ROW_COUNT * COL_COUNT);

function draw(event) {
    const start = event?.date ?? new Date()

    let hours = start.getHours();
    if (!settings.use24Hour) {
        hours = hours % 12 || 12;
    }

    let minutes = start.getMinutes();
    const hour1 = hours < 10 ? 0 : Math.floor(hours / 10);
    const hour2 = hours % 10;
    const minute1 = minutes < 10 ? 0 : Math.floor(minutes / 10);
    const minute2 = minutes % 10;

    let drawPositions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    drawPositions.sort((a, b) => Math.random() - 0.5);
    let drawPosition = drawPositions.pop();

    const animationTimeout = 220 - settings.animationSpeed;

    let shouldAnimate = settings.animateMinuteChange;
    let isDrawBackground = true;

    const intervalId = setInterval(() => {
        if (!shouldAnimate) {
            clearInterval(intervalId);
        }

        const singleCharWidth = render.getTextWidth("@", timeFont);
        const doubleCharWidth = singleCharWidth * 2;
        const betweenDigitMargin = doubleCharWidth;
        let totalBlockWidth = (COL_COUNT - 2) * doubleCharWidth + betweenDigitMargin;
        let startX = (render.width - totalBlockWidth) / 2;

        let betweenBlocksMargin = 24;
        let totalHeight = (ROW_COUNT * timeFont.height) * 2 + betweenBlocksMargin;
        let startY = (render.height - totalHeight) / 2;

        render.begin();
        if (isDrawBackground) {
            render.fillRectangle(bgColor, 0, 0, render.width, render.height);
            isDrawBackground = false;
        }

        updateEncryptedBlock(screenBufferBlock, hour1, hour2);
        for (let r = 0; r < ROW_COUNT; r++) {
            if (!settings.animateMinuteChange || drawPosition === r) {
                let nextX = startX;
                for (let c = 0; c < COL_COUNT; c++) {
                    let val = screenBufferBlock[(r * COL_COUNT) + c];

                    if (val !== 255) {
                        let char = CIPHER_CHARS[val];
                        render.drawText(char + char, timeFont, textColor, nextX, startY + (r * timeFont.height));
                    }

                    let digitSeparation = c === 6 || c === 7;
                    if (digitSeparation) {
                        nextX = nextX + singleCharWidth;
                    } else {
                        nextX = nextX + doubleCharWidth;
                    }
                }
            }
        }

        updateEncryptedBlock(screenBufferBlock, minute1, minute2);
        startY = startY + (ROW_COUNT * timeFont.height) + betweenBlocksMargin
        for (let r = 0; r < ROW_COUNT; r++) {
            if (!settings.animateMinuteChange || drawPosition === r) {
                let nextX = startX;
                for (let c = 0; c < COL_COUNT; c++) {
                    let val = screenBufferBlock[(r * COL_COUNT) + c];

                    if (val !== 255) {
                        let char = CIPHER_CHARS[val];
                        render.drawText(char + char, timeFont, textColor, nextX, startY + (r * timeFont.height));
                    }

                    let digitSeparation = c === 6 || c === 7;
                    if (digitSeparation) {
                        nextX = nextX + singleCharWidth;
                    } else {
                        nextX = nextX + doubleCharWidth;
                    }
                }
            }
        }
        render.end();

        if (drawPositions.length === 0) {
            shouldAnimate = false;
        } else {
            drawPosition = drawPositions.pop();
        }
    }, animationTimeout)
}

// Update every minute (fires immediately when registered)
watch.addEventListener("minutechange", draw);

const message = new Message({
    keys: ["BackgroundColor", "TextColor", "Use24Hour", "AnimateMinuteChange", "AnimationSpeed"],
    onReadable() {
        const msg = this.read();

        const bg = msg.get("BackgroundColor");
        if (bg !== undefined) {
            settings.backgroundColor = {r: (bg >> 16) & 0xFF, g: (bg >> 8) & 0xFF, b: bg & 0xFF};
        }
        const tc = msg.get("TextColor");
        if (tc !== undefined) {
            settings.textColor = {r: (tc >> 16) & 0xFF, g: (tc >> 8) & 0xFF, b: tc & 0xFF};
        }
        const hf = msg.get("Use24Hour");
        if (hf !== undefined) {
            settings.use24Hour = hf === 1;
        }
        const animate = msg.get("AnimateMinuteChange");
        if (animate !== undefined) {
            settings.animateMinuteChange = animate === 1;
        }
        const animationSpeed = msg.get("AnimationSpeed");
        if (animationSpeed !== undefined) {
            settings.animationSpeed = animationSpeed;
        }

        saveSettings();
        updateColors();
        draw();
    }
});