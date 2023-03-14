
function checkIfAnyCharNotInAsciiSet(str) {
    var regex = /[^\x00-\x7F]+/;
    return regex.test(str);
}

const form = document.querySelector('form');
form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = document.querySelector('#input').value;
    if (input === '') {
        const outputContainer = document.querySelector('#emoji-output-container');
        document.querySelector('#emoji-output').textContent = 'Please enter a punycode or emoji';
        return;
    }

    if (checkIfAnyCharNotInAsciiSet(input)) {
        const outputContainer = document.querySelector('#emoji-output-container');
        outputContainer.classList.add('visible');
        const output = document.querySelector('#emoji-output');
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
            const data = await response.text();
            if (data.includes('invalid punycode')) {
                outputContainer.classList.remove('visible');
                document.querySelector('#emoji-output').textContent = 'Please enter a valid punycode';
                return;
            }
            const output = document.querySelector('#emoji-output');
            output.textContent = data;
        } catch (error) {
            console.error(error);
        }
    }
    else {
        const outputContainer = document.querySelector('#emoji-output-container');
        outputContainer.classList.add('visible');
        const output = document.querySelector('#emoji-output');
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
            const data = await response.text();
            if (data.includes('invalid punycode')) {
                outputContainer.classList.remove('visible');
                document.querySelector('#emoji-output').textContent = 'Please enter a valid punycode';
                return;
            }
            const output = document.querySelector('#emoji-output');
            output.textContent = data;
        } catch (error) {
            console.error(error);
        }
    }
});