import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load core.js to evaluate its functions
const coreJsCode = fs.readFileSync(path.resolve(__dirname, 'core.js'), 'utf-8');

describe('core.js purely utility functions', () => {
    beforeEach(() => {
        // Reset the DOM for each test
        document.body.innerHTML = `
            <div id="footer-email"></div>
            <div id="contact-email"></div>
        `;

        // Evaluate the core.js script in the current jsdom context window
        // Be careful: this will execute IIFEs if present.
        // We only want to test the newly available obfuscateEmails function.
        const scriptEl = document.createElement('script');
        scriptEl.textContent = coreJsCode;
        document.body.appendChild(scriptEl);
    });

    it('should obfuscate emails into the correct DOM elements', () => {
        // Assert initial state is empty
        expect(document.getElementById('footer-email').innerHTML).toBe('');
        expect(document.getElementById('contact-email').innerHTML).toBe('');

        // Call our global utility function inside the JSDOM runtime
        const runner = document.createElement('script');
        runner.textContent = 'obfuscateEmails();';
        document.body.appendChild(runner);

        const expectedHref = '<a href="mailto:info@ecotech.co.in">info@ecotech.co.in</a>';
        expect(document.getElementById('footer-email').innerHTML).toBe(expectedHref);
        expect(document.getElementById('contact-email').innerHTML).toBe(expectedHref);
    });
});
