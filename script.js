const schoolData = {
    geovani: {
        classes: [
            { id: "geo_ita_3", name: "Italiano 3 - Segunda", dayOfWeek: 1 },
            { id: "geo_ita_1", name: "Italiano 1 - Segunda", dayOfWeek: 1 },
            { id: "geo_teens_1", name: "Teens 1 - Quarta", dayOfWeek: 3 },
            { id: "geo_cp_1", name: "Continua a Parlare 1 - Quarta", dayOfWeek: 3 },
            { id: "geo_book_3", name: "Book 3 - Sábado", dayOfWeek: 6 },
            { id: "geo_book_1", name: "Book 1 - Sábado", dayOfWeek: 6 }
        ]
    },
    patrick: {
        classes: [
            { id: "pat_adv_3", name: "Advanced 3 - Quinta", dayOfWeek: 4 },
            { id: "pat_adv_1", name: "Advanced 3 - Sábado", dayOfWeek: 6 }
        ]
    },
    thais: {
        classes: [
            { id: "tha_kt_1", name: "Keep Talking 1 - Segunda", dayOfWeek: 1 }
        ]
    },
    giulianna: {
        classes: [
            { id: "giu_cc_2", name: "Continúa Conversando 2 - Segunda", dayOfWeek: 1 },
            { id: "giu_book_1", name: "Book 1 - Segunda", dayOfWeek: 1 },
            { id: "giu_book_3", name: "Book 3 - Terça", dayOfWeek: 2 },
            { id: "giu_kids_2", name: "Kids 2 - Quarta", dayOfWeek: 3 }
        ]
    }
};

const rewardsCycle = {
    1: {
        1: { premio: "Chocolate para dividir na sala", dolares: 20 },
        2: { premio: "Atividade de 30’ com música escolhida pela turma", dolares: 50 },
        3: { premio: "1h de Série ou Filme na língua-alvo com atividade", dolares: 70 },
        4: { premio: "1h de Escape Room com o conteúdo", dolares: 100 }
    },
    2: {
        1: { premio: "Chocolate para dividir na sala", dolares: 20 },
        2: { premio: "Atividade de 30' com música da banda favorita", dolares: 50 },
        3: { premio: "1h de Série ou Filme", dolares: 70 },
        4: { premio: "1h de Murder Mystery eletrizante", dolares: 100 }
    },
    3: {
        1: { premio: "Chocolate para dividir na sala", dolares: 20 },
        2: { premio: "Atividade de 30' com música", dolares: 50 },
        3: { premio: "1h de Série ou Filme", dolares: 70 },
        4: { premio: "10% de desconto na mensalidade", dolares: 100 }
    },
    4: {
        1: { premio: "Chocolate para dividir na sala", dolares: 20 },
        2: { premio: "Atividade de 30' com música", dolares: 50 },
        3: { premio: "1h de Série ou Filme", dolares: 70 },
        4: { premio: "1h de Caça aos Patos imersiva", dolares: 100 }
    },
    5: {
        1: { premio: "Chocolate para dividir na sala", dolares: 20 },
        2: { premio: "Atividade de 30' com música", dolares: 50 },
        3: { premio: "10% de desconto na mensalidade", dolares: 70 },
        4: { premio: "Café da manhã/tarde ou Rodada de Pizza", dolares: 100 }
    }
};

let classRecords = JSON.parse(localStorage.getItem('knn_class_records')) || {};

let currentActiveTurma = null;
let selectedClassIndex = 0; 
let currentMonthVal = 8;
let currentYearVal = 2026;

function getExactClassDates(year, monthIndex, targetDayOfWeek) {
    let dates = [];
    let date = new Date(year, monthIndex, 1);

    while (date.getDay() !== targetDayOfWeek) {
        date.setDate(date.getDate() + 1);
    }

    while (date.getMonth() === monthIndex) {
        dates.push(new Date(date));
        date.setDate(date.getDate() + 7);
    }

    return dates;
}

function loadTeacherClasses() {
    const teacherKey = document.getElementById('teacherSelect').value;
    const classSelect = document.getElementById('classSelect');
    const controlPanel = document.getElementById('controlPanel');
    const statsRow = document.getElementById('statsRow');

    classSelect.innerHTML = '<option value="" disabled selected>-- Selecione a Turma --</option>';
    classSelect.disabled = false;
    controlPanel.style.display = 'none';
    statsRow.style.opacity = '0.4';
    currentActiveTurma = null;

    if (teacherKey && schoolData[teacherKey]) {
        const turmas = schoolData[teacherKey].classes;
        turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = turma.id;
            option.textContent = turma.name;
            classSelect.appendChild(option);
        });
    }
    updateTeacherRanking();
}

function onMonthOrClassChange() {
    const teacherKey = document.getElementById('teacherSelect').value;
    const classId = document.getElementById('classSelect').value;
    const controlPanel = document.getElementById('controlPanel');
    const statsRow = document.getElementById('statsRow');
    
    const monthYearStr = document.getElementById('monthSelect').value;
    const parts = monthYearStr.split('_');
    currentMonthVal = parseInt(parts[0]);
    currentYearVal = parseInt(parts[1]);

    if (teacherKey && classId) {
        const teacher = schoolData[teacherKey];
        currentActiveTurma = teacher.classes.find(t => t.id === classId);

        if (currentActiveTurma) {
            controlPanel.style.display = 'flex';
            statsRow.style.opacity = '1';

            const recordKey = `${currentActiveTurma.id}_${monthYearStr}`;
            if (!classRecords[recordKey]) {
                const dates = getExactClassDates(currentYearVal, currentMonthVal, currentActiveTurma.dayOfWeek);
                classRecords[recordKey] = {
                    weeks: dates.map(() => ({ total: 10, absent: 0, homework: true })),
                    bonusLives: 0
                };
                saveToLocalStorage();
            }

            const classDates = getExactClassDates(currentYearVal, currentMonthVal, currentActiveTurma.dayOfWeek);
            const today = new Date();
            selectedClassIndex = 0;
            classDates.forEach((d, idx) => {
                if (d <= today) selectedClassIndex = idx;
            });
            if (selectedClassIndex >= classDates.length) selectedClassIndex = classDates.length - 1;
            if (selectedClassIndex < 0) selectedClassIndex = 0;

            loadWeekDataIntoForm();
            renderDashboard();
        }
    } else {
        controlPanel.style.display = 'none';
        statsRow.style.opacity = '0.4';
    }
    updateTeacherRanking();
}

function selectWeek(index) {
    selectedClassIndex = index;
    loadWeekDataIntoForm();
    renderDashboard();
}

function recoverLife() {
    if (!currentActiveTurma) return;
    const monthYearStr = document.getElementById('monthSelect').value;
    const recordKey = `${currentActiveTurma.id}_${monthYearStr}`;
    if (classRecords[recordKey]) {
        classRecords[recordKey].bonusLives++;
        saveToLocalStorage();
        renderDashboard();
        calculateMetrics();
    }
}

function getLivesLostByAbsences(absentCount) {
    if (absentCount >= 5) return 3;
    if (absentCount >= 3) return 2;
    if (absentCount >= 1) return 1;
    return 0;
}

function loadWeekDataIntoForm() {
    if (!currentActiveTurma) return;
    const monthYearStr = document.getElementById('monthSelect').value;
    const recordKey = `${currentActiveTurma.id}_${monthYearStr}`;
    const weekData = classRecords[recordKey].weeks[selectedClassIndex];

    document.getElementById('totalStudents').value = weekData.total;
    document.getElementById('absentStudents').value = weekData.absent;
    document.getElementById('checkHomework').checked = weekData.homework;

    calculateMetrics();
}

function saveCurrentWeekData() {
    if (!currentActiveTurma) return;
    const monthYearStr = document.getElementById('monthSelect').value;
    const recordKey = `${currentActiveTurma.id}_${monthYearStr}`;
    
    const total = parseInt(document.getElementById('totalStudents').value) || 10;
    const absent = parseInt(document.getElementById('absentStudents').value) || 0;
    const homework = document.getElementById('checkHomework').checked;

    classRecords[recordKey].weeks[selectedClassIndex] = { total, absent, homework };
    
    saveToLocalStorage();

    renderDashboard();
    calculateMetrics();
    updateTeacherRanking();
}

function saveToLocalStorage() {
    localStorage.setItem('knn_class_records', JSON.stringify(classRecords));
}

function renderDashboard() {
    if (!currentActiveTurma) return;

    const classDates = getExactClassDates(currentYearVal, currentMonthVal, currentActiveTurma.dayOfWeek);
    const monthYearStr = document.getElementById('monthSelect').value;
    const recordKey = `${currentActiveTurma.id}_${monthYearStr}`;
    const recordData = classRecords[recordKey];
    const weeksData = recordData.weeks;

    if (selectedClassIndex >= classDates.length) selectedClassIndex = classDates.length - 1;
    if (selectedClassIndex < 0) selectedClassIndex = 0;

    const activeDateStr = classDates[selectedClassIndex] ? classDates[selectedClassIndex].toLocaleDateString('pt-BR') : '-';
    document.getElementById('activeWeekLabel').innerText = `Aula Selecionada: ${activeDateStr}`;

    let timelineHtml = '';
    let totalFaltasMes = 0;
    let totalAulasRegistradas = classDates.length;
    let totalVidasPerdidas = 0;

    let currentStreak = 0;
    for (let i = 0; i <= selectedClassIndex; i++) {
        const w = weeksData[i];
        const lost = getLivesLostByAbsences(w.absent);

        if (lost === 0) {
            currentStreak++;
        } else {
            currentStreak = 1;
        }
    }

    classDates.forEach((d, idx) => {
        const wNum = idx + 1;
        const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        const wData = weeksData[idx];

        totalFaltasMes += wData.absent;
        const lostLives = getLivesLostByAbsences(wData.absent);
        const failedHomework = !wData.homework;

        totalVidasPerdidas += lostLives;

        let statusClass = '';
        let statusText = `Nível ${wNum}`;

        if (idx === selectedClassIndex) {
            statusClass = 'active';
        } else if (lostLives > 0) {
            statusClass = 'danger-week';
            statusText = `-${lostLives} vidas ❌`;
        } else if (failedHomework) {
            statusClass = 'danger-week';
            statusText = `Tarefa ⚠️`;
        } else {
            statusClass = 'completed';
        }

        timelineHtml += `
            <div class="week-step ${statusClass}" onclick="selectWeek(${idx})">
                <span class="week-num">Sem ${wNum}</span>
                <span class="week-dates">${dateStr}</span>
                <span class="week-status">${statusText}</span>
            </div>
        `;
    });

    let vidasRestantes = 3 - totalVidasPerdidas + recordData.bonusLives;
    if (vidasRestantes > 3) vidasRestantes = 3;
    if (vidasRestantes < 0) vidasRestantes = 0;

    let heartsHtml = '';
    for (let i = 0; i < 3; i++) {
        heartsHtml += i < vidasRestantes ? '❤️ ' : '🖤 ';
    }
    heartsHtml += `<button class="btn-recover" onclick="recoverLife()" title="Trazer amigo para aula">+1 Vida</button>`;

    document.getElementById('livesDisplay').innerHTML = heartsHtml;
    document.getElementById('streakCounterDisplay').innerHTML = `🔥 Streak: Nível ${currentStreak}`;

    document.getElementById('timelineContainer').innerHTML = timelineHtml || '<div style="font-size:0.8rem; color: var(--text-muted); text-align: center; width: 100%;">Nenhuma aula encontrada para este mês.</div>';
    document.getElementById('activeWeekTitle').innerHTML = `<label>Lançamento de Chamada (Aula de ${activeDateStr})</label>`;

    document.getElementById('adminTotalFaltas').innerText = totalFaltasMes;
    const mediaGeral = totalAulasRegistradas > 0 ? ((totalFaltasMes / (totalAulasRegistradas * 10)) * 100).toFixed(1) : 0;
    document.getElementById('adminMediaFaltas').innerText = mediaGeral + '%';

    updateTeacherRanking();
}

function calculateMetrics() {
    if (!currentActiveTurma) return;

    const absent = parseInt(document.getElementById('absentStudents').value) || 0;
    const homeworkOk = document.getElementById('checkHomework').checked;
    
    const monthYearStr = document.getElementById('monthSelect').value;
    const recordKey = `${currentActiveTurma.id}_${monthYearStr}`;
    const recordData = classRecords[recordKey];
    
    let totalVidasPerdidasCalc = 0;
    recordData.weeks.forEach((w) => {
        totalVidasPerdidasCalc += getLivesLostByAbsences(w.absent);
    });
    
    const vidasFinais = 3 - totalVidasPerdidasCalc + recordData.bonusLives;

    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultStatusText');
    const detailText = document.getElementById('metricDetailText');

    const livesLostThisClass = getLivesLostByAbsences(absent);

    const baseDate = new Date(2026, 8, 1);
    const targetDate = new Date(currentYearVal, currentMonthVal, 1);
    const diffMonths = (targetDate.getFullYear() - baseDate.getFullYear()) * 12 + (targetDate.getMonth() - baseDate.getMonth());
    
    let cicloMes = (diffMonths % 5) + 1;
    if (cicloMes < 1) cicloMes += 5;

    let nivelAtualStreak = 0;
    for (let i = 0; i <= selectedClassIndex; i++) {
        const w = recordData.weeks[i];
        const lost = getLivesLostByAbsences(w.absent);
        if (lost === 0) {
            nivelAtualStreak++;
        } else {
            nivelAtualStreak = 1;
        }
    }
    if (nivelAtualStreak > 4) nivelAtualStreak = 4;

    const premioInfo = rewardsCycle[cicloMes][nivelAtualStreak] || { premio: "Nenhum prêmio", dolares: 0 };

    resultBox.className = "result-box";

    // Linhas estruturadas para o painel
    let linhaStreak = "";
    let linhaPremio = "";
    let linhaBonus = "";
    let linhaAlerta = "";

    if (!homeworkOk) {
        linhaAlerta = `<br>⚠️ ALERTA: Professor, notifique a turma que o super prêmio não será entregue se houver tarefas pendentes no final do mês, mesmo se o streak estiver em nível máximo."`;
    }

    if (vidasFinais <= 0) {
        resultBox.classList.add('danger');
        resultText.style.color = 'var(--danger-red)';
        resultText.innerText = '💀 Vidas Zeradas!';
        detailText.innerHTML = `A turma perdeu todas as vidas e está sem direito a concorrer aos prêmios até recuperarem uma vida!`;
    } else if (absent > 0) {
        // Se faltou alguém na semana atual, streak volta para o nível 1 e NÃO garante prêmio para a próxima semana
        resultBox.classList.add('danger');
        resultText.style.color = 'var(--danger-red)';
        resultText.innerText = '⚠️ Faltas registradas nesta aula!';
        
        linhaStreak = `Streak voltou para o Nível 1!`;
        linhaPremio = `🏆 Prêmio: Nenhum garantido para a próxima semana (houve falta nesta aula)`;
        linhaBonus = `🚀 Bônus: $0 Dólares por aluno`;
        
        detailText.innerHTML = `${linhaStreak}<br>${linhaPremio}<br>${linhaBonus}${linhaAlerta}`;
    } else {
        resultBox.className = "result-box success";
        resultText.style.color = 'var(--success-green)';
        resultText.innerText = `🎁 Prêmio Desbloqueado: Nível ${nivelAtualStreak}`;
        
        linhaStreak = `Streak mantido no Nível ${nivelAtualStreak}!`;
        linhaPremio = `🏆 Prêmio: ${premioInfo.premio}`;
        linhaBonus = `🚀 Bônus: ${premioInfo.dolares} Dólares por aluno`;
        
        detailText.innerHTML = `${linhaStreak}<br>${linhaPremio}<br>${linhaBonus}${linhaAlerta}`;
    }
}

function updateTeacherRanking() {
    const rankingContainer = document.getElementById('teacherRankingList');
    if (!rankingContainer) return;

    let teacherStats = [];
    const monthYearStr = document.getElementById('monthSelect').value;

    for (const teacherKey in schoolData) {
        let totalFaltasTeacher = 0;
        let totalAlunosEsperadosTeacher = 0;

        schoolData[teacherKey].classes.forEach(turma => {
            const recordKey = `${turma.id}_${monthYearStr}`;
            if (classRecords[recordKey] && classRecords[recordKey].weeks) {
                classRecords[recordKey].weeks.forEach(w => {
                    totalFaltasTeacher += w.absent;
                    totalAlunosEsperadosTeacher += w.total;
                });
            }
        });

        const percent = totalAlunosEsperadosTeacher > 0 
            ? ((totalFaltasTeacher / totalAlunosEsperadosTeacher) * 100).toFixed(1) 
            : 0;

        const teacherNames = {
            geovani: "Geovani Pires",
            patrick: "Patrick Carvalhais",
            thais: "Thais Bagolin",
            giulianna: "Giulianna Miguel",
            vinicius: "Vinicius Eduardo",
            renan: "Renan Librandi",
            hillary: "Hillary Akemi",
            jefferson: "Jefferson Gomes"
        };

        teacherStats.push({
            name: teacherNames[teacherKey] || teacherKey,
            percent: parseFloat(percent),
            faltas: totalFaltasTeacher
        });
    }

    teacherStats.sort((a, b) => a.percent - b.percent);

    let html = '';
    teacherStats.forEach((t, index) => {
        let medalha = '';
        if (index === 0) medalha = '🥇 ';
        else if (index === 1) medalha = '🥈 ';
        else if (index === 2) medalha = '🥉 ';
        else medalha = `${index + 1}º `;

        html += `
            <div class="ranking-item">
                <span>${medalha}<strong>${t.name}</strong></span>
                <span><strong>${t.percent}%</strong> de faltas</span>
            </div>
        `;
    });

    rankingContainer.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', () => {
    updateTeacherRanking();
});