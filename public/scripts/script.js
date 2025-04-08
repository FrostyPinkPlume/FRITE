const chars = "'.!?-><ÉÈÀÇABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ";
const HIT_PROBABILITY = 0.25;

function prepareAllSplitFlaps() {
    $('.split-flap').each(function () {
        const $display = $(this);
        const finalText = transformAndFilterCharacters($display.data("display"));
        const placeholderText = transformAndFilterCharacters($display.data("placeholder"));

        $display.empty();

        var maxNumberOfLetter = Math.max(finalText.length, placeholderText.length);

        for (let i = 0; i < maxNumberOfLetter; i++) {
            const placeholderChar = placeholderText.charAt(i) || ' ';
            const finalChar = finalText.charAt(i) || ' ';
            $display.append(createFlap(placeholderChar, finalChar));
        }
    });
}

function createFlap(char, finalChar) {
    return `<div class='flap active-flap' data-finalchar='${finalChar}'><div class='char'>${char}</div></div>`;
}

function randomChar() {
    return chars[Math.floor(Math.random() * chars.length)];
}

function transformAndFilterCharacters(text) {
    // Transformer en majuscules
    let transformedText = text.toUpperCase();

    // Filtrer les caractères pour ne conserver que ceux présents dans `chars`
    return transformedText.split('').filter(char => chars.includes(char)).join('');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

$(function() {
    prepareAllSplitFlaps();
    setTimeout(() => updateText(), 3000);
    
    $("#darkmode-toggle").click(function() {
        $("#darkmode-toggle").toggleClass("darkmode-active");
        $("html").toggleClass("dark");
    });

    // Désactive les inputs submit des formulaires non valides
    $('form').each(function () {
        const $form = $(this);
        const $submit = $form.find('[type="submit"]');
  
        function updateButtonState() {
          // Vérifier validité du form
          let isValid = true;
          $form.find('[required]').each(function () {
            if (!this.checkValidity()) {
              isValid = false;
              return false; // on sort du .each
            }
          });
          $submit.prop('disabled', !isValid);
        }
  
        $form.on('input change', updateButtonState);
  
        // Pour gérer les champs préremplis ou autofill
        updateButtonState();
    });
});
