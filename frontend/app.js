require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.28.1/min/vs' }});

require.onError = function (err) {
    const errorMessageDiv = document.getElementById("error-message");
    if (errorMessageDiv) {
        errorMessageDiv.textContent = 'Error: The code editor failed to load. Please check your internet connection and try refreshing the page. Details: ' + err;
    }
    console.error(err);
};

require(['vs/editor/editor.main'], function() {
    const loader = document.getElementById("loader");
    const errorMessageDiv = document.getElementById("error-message");
    const userInput = document.getElementById("user-input");
    const analyzeBtn = document.getElementById("analyze-btn");
    
    const step2Details = document.getElementById("step-2-details");
    const diagramDetails = document.getElementById("diagram-details");
    const step4Details = document.getElementById("step-4-details");

    const rephrasedText = document.getElementById("rephrased-text");
    const confirmBtn = document.getElementById("confirm-btn");
    
    const exportJsonBtn = document.getElementById("export-json-btn");
    const exportPngBtn = document.getElementById("export-png-btn");
    const exportPdfBtn = document.getElementById("export-pdf-btn");
    
    const promptButtons = document.querySelectorAll('.prompt-pill');
    promptButtons.forEach(button => {
        button.addEventListener('click', () => {
            userInput.value = button.dataset.prompt;
            // Clear step 2 and diagram when new prompt is selected
            clearStep2AndDiagram();
        });
    });

    // Clear step 2 and diagram when user starts typing in step 1
    let previousInputValue = '';
    userInput.addEventListener('input', () => {
        const currentValue = userInput.value;
        // Clear when user starts typing new content (not just when emptying)
        if (currentValue !== previousInputValue && (step2Details.open || diagramDetails.open || step4Details.open)) {
            clearStep2AndDiagram();
        }
        previousInputValue = currentValue;
    });

    const socket = io();
    const diagramEditor = new dhx.DiagramEditor("diagram-container", {
        type: "org",
        shapeType: "img-card"
    });

    const jsonEditor = monaco.editor.create(document.getElementById('json-editor'), {
        value: '',
        language: 'json',
        theme: 'vs-dark',
        readOnly: false,
        automaticLayout: true
    });

    let debounceTimer;
    jsonEditor.onDidChangeModelContent(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            try {
                const jsonData = JSON.parse(jsonEditor.getValue());
                diagramEditor.diagram.data.parse(jsonData);
                showError('');
            } catch (e) {
                // It's okay if the JSON is temporarily invalid while typing
            }
        }, 500);
    });

    analyzeBtn.addEventListener('click', () => {
        const text = userInput.value;
        if (!text) {
            showError("Please enter a description.");
            return;
        }
        setLoading(true, analyzeBtn);
        clearStep2AndDiagram();

        socket.emit('rephrase_text', { text }, (response) => {
            setLoading(false, analyzeBtn);
            if (response.status === 'success') {
                rephrasedText.value = response.payload;
                step2Details.open = true;
                showError('');
            } else {
                showError("Analysis error: " + response.message);
            }
        });
    });

    confirmBtn.addEventListener('click', () => {
        const verifiedText = rephrasedText.value;
        if (!verifiedText) {
            showError("Text for analysis cannot be empty.");
            return;
        }
        setLoading(true, confirmBtn);

        socket.emit('generate_diagram', { text: verifiedText }, (response) => {
            setLoading(false, confirmBtn);
            if (response.status === 'success') {
                const data = response.payload;
                jsonEditor.setValue(JSON.stringify(data, null, 2));
                diagramEditor.diagram.data.parse(data);

                diagramDetails.open = true;
                step4Details.open = true;
                showError('');

                setTimeout(() => {
                    step2Details.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);

            } else {
                showError("Generation error: " + response.message);
            }
        });
    });
    
    exportPngBtn.addEventListener('click', () => {
        diagramEditor.diagram.export.png();
    });

    exportPdfBtn.addEventListener('click', () => {
        diagramEditor.diagram.export.pdf();
    });

    exportJsonBtn.addEventListener('click', () => {
        const jsonData = diagramEditor.diagram.data.serialize();
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'diagram-export.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    function setLoading(isLoading, button) {
        if (isLoading) {
            loader.classList.remove("hidden");
            if (button) button.disabled = true;
        } else {
            loader.classList.add("hidden");
            if (button) button.disabled = false;
        }
    }

    function showError(message) {
        errorMessageDiv.textContent = message;
    }

    function clearStep2AndDiagram() {
        // Clear rephrased text (step 2)
        rephrasedText.value = '';

        // Clear diagram
        diagramEditor.diagram.data.parse([]);

        // Clear JSON editor
        jsonEditor.setValue('');

        // Close all detail sections
        step2Details.open = false;
        diagramDetails.open = false;
        step4Details.open = false;

        // Clear error messages
        showError('');
    }
});
