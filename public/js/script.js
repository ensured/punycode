
function checkIfAnyCharNotInAsciiSet(str) {
    var regex = /[^\x00-\x7F]+/;
    return regex.test(str);
}

const form = document.querySelector('form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.querySelector('#input').value;
    if (input === '') {
        const outputContainer = document.querySelector('#output-container');
        document.querySelector('#output').textContent = 'Please enter a punycode or emoji';
        return;
    }

    if (checkIfAnyCharNotInAsciiSet(input)) {
        const outputContainer = document.querySelector('#output-container');
        outputContainer.classList.add('visible');
        const output = document.querySelector('#output');
        try {
            const response = await fetch('/unicode_to_punycode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `unicode=${input}`
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            let punycodeStr = data.punycodeStr;
            let charLength = data.charLength;
            const output = document.querySelector('#output');
            output.innerHTML = punycodeStr + charLength
        } catch (error) {
            console.error(error);
        }
    }
    else {
        const outputContainer = document.querySelector('#output-container');
        outputContainer.classList.add('visible');
        const output = document.querySelector('#output');
        try {
            const response = await fetch('/punycode_to_unicode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `punycode=${input}`
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let data = await response.json();
            decodedStr = data.decodedStr;
            charLength = data.charLength;

            const output = document.querySelector('#output');
            output.innerHTML = decodedStr + charLength;
        } catch (error) {
            console.error(error);
        }
    }
});