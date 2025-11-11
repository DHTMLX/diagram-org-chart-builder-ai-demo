require.config({ paths: { 'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.28.1/min/vs' }});

require.onError = function (err) {
    const errorMessageElement = document.getElementById("error-message");
    if (errorMessageElement) {
        errorMessageElement.textContent = 'Error: The code editor failed to load. Please check your internet connection and try refreshing the page. Details: ' + err;
    }
    console.error(err);
};

function initializeApp(monacoInstance) {
    // DOM Element Lookups
    const userInputTextArea = document.getElementById("user-input");
    const analyzeButton = document.getElementById("analyze-btn");
    const confirmButton = document.getElementById("confirm-btn");
    const reviewTextArea = document.getElementById("rephrased-text");
    const errorMessageElement = document.getElementById("error-message");
    
    const reviewSection = document.getElementById("review-section");
    const diagramSection = document.getElementById("diagram-section");
    const exportSection = document.getElementById("export-section");

    const exportJsonButton = document.getElementById("export-json-btn");
    const exportPngButton = document.getElementById("export-png-btn");
    const exportPdfButton = document.getElementById("export-pdf-btn");
    
    const promptButtons = document.querySelectorAll('.prompt-pill');

    // State
    let previousInputValue = '';
    let debounceTimer;
    
    // Initializations
    const socket = io();
    const diagramEditor = new dhx.DiagramEditor("diagram-container", {
        type: "org",
        shapeType: "img-card"
    });

    const jsonEditor = monacoInstance.editor.create(document.getElementById('json-editor'), {
        value: '',
        language: 'json',
        theme: 'vs-dark',
        readOnly: false,
        automaticLayout: true
    });

    // Functions
    function setButtonLoadingState(isLoading, button) {
        if (!button) return;

        if (isLoading) {
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '💡 Thinking...';
            button.disabled = true;
        } else {
            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
            }
            button.disabled = false;
        }
    }

    function displayError(message) {
        errorMessageElement.textContent = message;
    }

    function resetUI() {
        reviewTextArea.value = '';
        diagramEditor.diagram.data.parse([]);
        jsonEditor.setValue('');
        
        reviewSection.open = false;
        diagramSection.open = false;
        exportSection.open = false;
        
        displayError('');
    }

    // Event Listeners
    promptButtons.forEach(button => {
        button.addEventListener('click', () => {
            userInputTextArea.value = button.dataset.prompt;
            resetUI();
        });
    });

    userInputTextArea.addEventListener('input', () => {
        const currentValue = userInputTextArea.value;
        if (currentValue !== previousInputValue && (reviewSection.open || diagramSection.open || exportSection.open)) {
            resetUI();
        }
        previousInputValue = currentValue;
    });

    jsonEditor.onDidChangeModelContent(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            try {
                const jsonData = JSON.parse(jsonEditor.getValue());
                diagramEditor.diagram.data.parse(jsonData);
                displayError('');
            } catch (e) {
                // It's okay if the JSON is temporarily invalid while typing
            }
        }, 500);
    });

    analyzeButton.addEventListener('click', () => {
        const text = userInputTextArea.value;
        if (!text) {
            displayError("Please enter a description.");
            return;
        }
        setButtonLoadingState(true, analyzeButton);
        resetUI();

        socket.emit('rephrase_text', { text }, (response) => {
            setButtonLoadingState(false, analyzeButton);
            if (response.status === 'success') {
                reviewTextArea.value = response.payload;
                reviewSection.open = true;
                displayError('');
            } else {
                displayError("Analysis error: " + response.message);
            }
        });
    });

    confirmButton.addEventListener('click', () => {
        const verifiedText = reviewTextArea.value;
        if (!verifiedText) {
            displayError("Text for analysis cannot be empty.");
            return;
        }
        setButtonLoadingState(true, confirmButton);

        socket.emit('generate_diagram', { text: verifiedText }, (response) => {
            setButtonLoadingState(false, confirmButton);
            if (response.status === 'success') {
                const data = response.payload;
                jsonEditor.setValue(JSON.stringify(data, null, 2));
                diagramEditor.diagram.data.parse(data);

                diagramSection.open = true;
                exportSection.open = true;
                displayError('');

                setTimeout(() => {
                    reviewSection.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);

            } else {
                displayError("Generation error: " + response.message);
            }
        });
    });
    
    exportPngButton.addEventListener('click', () => {
        diagramEditor.diagram.export.png();
    });

    exportPdfButton.addEventListener('click', () => {
        diagramEditor.diagram.export.pdf();
    });

    exportJsonButton.addEventListener('click', () => {
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
}

// Entry point: Load the Monaco editor and then initialize the application.
require(['vs/editor/editor.main'], function(monaco) {
    initializeApp(monaco);
});