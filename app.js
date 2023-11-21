const { jsPDF } = window.jspdf;

document.getElementById('questionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const totalMarks = parseInt(document.getElementById('totalMarks').value);
    const easyPercent = parseInt(document.getElementById('easyPercent').value);
    const mediumPercent = parseInt(document.getElementById('mediumPercent').value);
    const hardPercent = parseInt(document.getElementById('hardPercent').value);
  
    generateQuestionPaper(totalMarks, easyPercent, mediumPercent, hardPercent);
});

function generateQuestionPaper(totalMarks, easyPercent, mediumPercent, hardPercent) {
    const loadQuestions = () => {
        return fetch('questions.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                return data.questions;
            })
            .catch(error => {
                console.error('There was a problem fetching the questions:', error);
            });
    };

    loadQuestions().then(questions => {
        const easyQuestions = questions.filter(q => q.difficulty === 'Easy');
        const mediumQuestions = questions.filter(q => q.difficulty === 'Medium');
        const hardQuestions = questions.filter(q => q.difficulty === 'Hard');

        const easyCount = Math.round((easyPercent / 100) * (totalMarks / 2)); // Each easy question is of 2 marks
        const mediumCount = Math.round((mediumPercent / 100) * (totalMarks / 5)); // Each medium question is of 5 marks
        const hardCount = Math.round((hardPercent / 100) * (totalMarks / 10)); // Each hard question is of 10 marks

        const selectedEasyQuestions = selectRandomQuestions(easyQuestions, easyCount);
        const selectedMediumQuestions = selectRandomQuestions(mediumQuestions, mediumCount);
        const selectedHardQuestions = selectRandomQuestions(hardQuestions, hardCount);

        const questionPaper = [...selectedEasyQuestions, ...selectedMediumQuestions, ...selectedHardQuestions];

        displayQuestions(questionPaper);
    });
}

function selectRandomQuestions(questions, count) {
    return questions.slice(0, count);
}


function displayQuestions(questionPaper) {
    const questionDisplay = document.getElementById('questionDisplay');
    questionDisplay.innerHTML = ''; // Clear previous content

    questionPaper.forEach(question => {
        const questionElement = document.createElement('div');
        questionElement.classList.add('question');
        questionElement.innerHTML = `
            <p><strong>Question:</strong> ${question.question}</p>
            <p><strong>Subject:</strong> ${question.subject}</p>
            <p><strong>Topic:</strong> ${question.topic}</p>
            <p><strong>Difficulty:</strong> ${question.difficulty}</p>
            <p><strong>Marks:</strong> ${question.marks}</p>
            <hr>
        `;
        questionDisplay.appendChild(questionElement);
    });
}


document.getElementById('questionForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // ... (existing code for generating question paper)
});

// Function to generate PDF from the displayed questions
function generatePDF(questionPaper) {
    const doc = new jsPDF();
    let yPos = 5;
    let pageIndex = 1;

    doc.setFontSize(22); // Increase font size for the title
    const title = 'Question Paper';
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const xOffset = (doc.internal.pageSize.width - titleWidth) / 2;
    doc.text(title, xOffset, yPos); // Add centered title
    
    yPos += 6; // Adjust the Y position for the questions
    doc.setFontSize(12);
    questionPaper.forEach((question, index) => {
        const text = `
            Question ${index + 1}: ${question.question}
            Marks: ${question.marks}
        `;

        doc.text(text, 6, yPos);

        yPos += 15; // Increment Y position for the next question

        // Check if content exceeds the page height
        if (yPos >= 280) { // Adjust this value based on your page height
            doc.addPage();
            yPos = 10;
            pageIndex += 1;
        }
    });

    // Save the PDF with a specific name
    doc.save(`question_paper_page_${pageIndex}.pdf`);
}

document.getElementById('downloadBtn').addEventListener('click', function() {
    const questionDisplay = document.getElementById('questionDisplay');
    const questionElements = questionDisplay.querySelectorAll('.question');
    const questionPaper = Array.from(questionElements).map(element => ({
        question: element.querySelector('p:nth-child(1)').textContent.split(': ')[1],
        subject: element.querySelector('p:nth-child(2)').textContent.split(': ')[1],
        topic: element.querySelector('p:nth-child(3)').textContent.split(': ')[1],
        difficulty: element.querySelector('p:nth-child(4)').textContent.split(': ')[1],
        marks: element.querySelector('p:nth-child(5)').textContent.split(': ')[1],
    }));

    generatePDF(questionPaper);
});
