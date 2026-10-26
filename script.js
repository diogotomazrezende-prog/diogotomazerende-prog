
"use strict";

// ========================================
// 1. DADOS FICTÍCIOS DO 8º ANO
// ========================================

// Estes são os dados brutos. As notas podem estar
// na escala de 0 a 100 ou na escala de 0 a 10.
const disciplinas = [
  { disciplina: "Língua Portuguesa", tri1: 82, tri2: "7,8", tri3: 85, faltas: [2, 1, 1] },
  { disciplina: "Matemática", tri1: 52, tri2: "5,8", tri3: null, faltas: [3, 2, 1] },
  { disciplina: "Ciências", tri1: "8,1", tri2: 76, tri3: 8.0, faltas: [1, 2, 0] },
  { disciplina: "História", tri1: 7.0, tri2: 84, tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Geografia", tri1: 68, tri2: 7.3, tri3: "7,9", faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 86, tri2: "8,1", tri3: 8.7, faltas: [1, 0, 0] },
  { disciplina: "Arte", tri1: 9.0, tri2: 92, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 95, tri2: 9.0, tri3: "9,4", faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 88, tri2: 9.1, tri3: 93, faltas: [1, 0, 1] },
  { disciplina: "Educação Financeira", tri1: 74, tri2: "7,8", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Estudo Orientado", tri1: 8.0, tri2: 83, tri3: "8,5", faltas: [0, 1, 0] },
  { disciplina: "Redação e Leitura", tri1: 62, tri2: "6,8", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 48, tri2: 5.6, tri3: "6,0", faltas: [2, 2, 1] },
  { disciplina: "Literatura Arte e Movimento", tri1: "7,7", tri2: 80, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Práticas Experimentais", tri1: 58, tri2: "6,2", tri3: 6.4, faltas: [1, 1, 1] }
];

// ========================================
// 2. NORMALIZAR AS NOTAS
// ========================================

// Converte notas válidas para a escala de 0 a 10.
// Retorna null quando a nota está ausente ou é inválida.
function normalizarNota(valor) {
  if (valor === null || valor === undefined) {
    return null;
  }

  if (typeof valor === "string" && valor.trim() === "") {
    return null;
  }

  // Aceita números e textos com ponto ou vírgula decimal.
  if (typeof valor !== "number" && typeof valor !== "string") {
    return null;
  }

  const numero = typeof valor === "string"
    ? Number(valor.trim().replace(",", "."))
    : valor;

  if (!Number.isFinite(numero) || numero < 0 || numero > 100) {
    return null;
  }

  // Valores acima de 10 estão na escala de 0 a 100.
  if (numero > 10) {
    return numero / 10;
  }

  return numero;
}

// Mostra as notas sempre com uma casa decimal.
function formatarNota(nota) {
  if (nota === null) {
    return "Ainda não lançada";
  }

  return nota.toFixed(1).replace(".", ",");
}

// ========================================
// 3. CALCULAR A MÉDIA E AS FALTAS
// ========================================

function calcularMedia(notas) {
  // Notas ausentes ou inválidas não entram na média.
  const notasValidas = notas.filter(nota => nota !== null);

  if (notasValidas.length === 0) {
    return null;
  }

  const soma = notasValidas.reduce(
    (total, nota) => total + nota,
    0
  );

  return soma / notasValidas.length;
}

function somarFaltas(faltas) {
  return faltas.reduce((total, falta) => total + falta, 0);
}

function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }

  if (media >= 6) {
    return "Bom desempenho";
  }

  return "Atenção";
}

// ========================================
// 4. PREPARAR OS DADOS DO BOLETIM
// ========================================

function prepararDisciplina(item) {
  const notas = [
    normalizarNota(item.tri1),
    normalizarNota(item.tri2),
    normalizarNota(item.tri3)
  ];

  const media = calcularMedia(notas);
  const faltas = somarFaltas(item.faltas);

  return {
    disciplina: item.disciplina,
    notas: notas,
    media: media,
    faltas: faltas,
    situacao: definirSituacao(media)
  };
}

// ========================================
// 5. PREENCHER A TABELA
// ========================================

function criarCelula(texto) {
  const celula = document.createElement("td");
  celula.textContent = texto;
  return celula;
}

function criarCelulaSituacao(situacao) {
  const celula = document.createElement("td");
  const etiqueta = document.createElement("span");

  etiqueta.classList.add("situacao");

  if (situacao === "Bom desempenho") {
    etiqueta.classList.add("situacao-bom");
  } else if (situacao === "Atenção") {
    etiqueta.classList.add("situacao-atencao");
  } else {
    etiqueta.classList.add("situacao-indisponivel");
  }

  etiqueta.textContent = situacao;
  celula.appendChild(etiqueta);

  return celula;
}

function preencherTabela(resultados) {
  const corpoTabela = document.getElementById("corpo-tabela");

  // Remove a mensagem inicial de carregamento.
  corpoTabela.replaceChildren();

  resultados.forEach(item => {
    const linha = document.createElement("tr");

    linha.appendChild(criarCelula(item.disciplina));

    item.notas.forEach(nota => {
      linha.appendChild(criarCelula(formatarNota(nota)));
    });

    linha.appendChild(criarCelula(formatarNota(item.media)));
    linha.appendChild(criarCelula(String(item.faltas)));
    linha.appendChild(criarCelulaSituacao(item.situacao));

    corpoTabela.appendChild(linha);
  });
}

// ========================================
// 6. PREENCHER OS CARDS DE RESUMO
// ========================================

function preencherCards(resultados) {
  const disciplinasComMedia = resultados.filter(
    item => item.media !== null
  );

  const mediaGeral = calcularMedia(
    disciplinasComMedia.map(item => item.media)
  );

  const totalFaltas = resultados.reduce(
    (total, item) => total + item.faltas,
    0
  );

  const totalBomDesempenho = resultados.filter(
    item => item.situacao === "Bom desempenho"
  ).length;

  const totalAtencao = resultados.filter(
    item => item.situacao === "Atenção"
  ).length;

  document.getElementById("media-geral").textContent =
    mediaGeral === null ? "—" : formatarNota(mediaGeral);

  document.getElementById("total-faltas").textContent =
    String(totalFaltas);

  document.getElementById("total-bom-desempenho").textContent =
    String(totalBomDesempenho);

  document.getElementById("total-atencao").textContent =
    String(totalAtencao);
}

// ========================================
// 7. INICIAR O BOLETIM
// ========================================

function iniciarBoletim() {
  const resultados = disciplinas.map(prepararDisciplina);

  preencherTabela(resultados);
  preencherCards(resultados);
}

// A frequência de 92% é apenas demonstrativa.
// No futuro, ela será tratada de outra forma,
// sem inventar uma fórmula baseada no total de faltas.

iniciarBoletim();
