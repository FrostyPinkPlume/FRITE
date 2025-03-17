const chars = "'.!?-><ÉÈÀÇABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
const HIT_PROBABILITY = 0.25;

function prepareAllSplitFlaps() {
    $('.split-flap').each(function () {
        const $display = $(this);
        const finalText = transformAndFilterCharacters($display.data("display"));

        $display.empty();

        finalText.split('').forEach(char => {
            $display.append(createFlap(randomChar(), char));
        });
    });
}

function createFlap(char, finalChar) {
    return `<div class='flap active-flap' data-finalchar='${finalChar}'><div class='char'>${char}</div></div>`;
}

function randomChar() {
    return chars[Math.floor(Math.random() * chars.length)];
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function transformAndFilterCharacters(text) {
    // Transformer en majuscules
    let transformedText = text.toUpperCase();

    // Filtrer les caractères pour ne conserver que ceux présents dans `chars`
    return transformedText.split('').filter(char => chars.includes(char)).join('');
}

async function updateText() {
    while ($('.active-flap').length > 0) {
        $('.active-flap').each(function () {
        const $flap = $(this);

        $flap.addClass('flipping');
        setTimeout(() => {
            let randomized_char = randomChar();
            $flap.find('.char').text(randomized_char);
            $flap.removeClass('flipping');

            if (Math.random() <= HIT_PROBABILITY || $flap.data('finalchar') === randomized_char) {
            $flap.find('.char').text($flap.data('finalchar'));
            $flap.removeClass("active-flap");
            }
        }, 100);
        });
        await sleep(200); // Ajoutez un délai pour éviter de bloquer le thread principal
    }
}

console.log("0");

$(function() {
    console.log("A");
    prepareAllSplitFlaps();
    console.log("B");
    setTimeout(() => updateText(), 1000);
    console.log("C");
});