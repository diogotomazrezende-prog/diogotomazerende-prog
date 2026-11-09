"use strict";

// ========================================
// CONFIGURAÇÃO FIXA DO ALUNO
// ========================================
const CONFIG_ALUNO = {
  turma: "8B",
  numeroChamada: 8,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// Variável global em memória para o PIN da sessão
let pinSessao = "";

// Dados locais atuais exibidos/editados
let dadosLocais = [];

// ========================================
// 1. DADOS FICTÍCIOS DO 8º ANO
// ========================================

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

function normalizarNota(valor) {
  if (valor === null || valor === undefined) {
    return null;
  }

  if (typeof valor === "string" && valor.trim() === "") {
    return null;
  }

  if (typeof valor !== "number" && typeof valor !== "string") {
    return null;
  }

  const numero = typeof valor === "string"
    ? Number(valor.trim().replace(",", "."))
    : valor;

  if (!Number.isFinite(numero) || numero < 0 || numero > 100) {
    return null;
  }

  if (numero > 10) {
    return numero / 10;
  }

  return numero;
}

function formatarNota(nota) {
  if (nota === null || nota === undefined) {
    return "Ainda não lançada";
  }

  return nota.toFixed(1).replace(".", ",");
}

// ========================================
// 3. CALCULAR A MÉDIA E AS FALTAS
// ========================================

function calcularMedia(notas) {
  const notasValidas = notas.filter(nota => nota !== null && nota !== undefined);

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
  if (!Array.isArray(faltas)) return 0;
  return faltas.reduce((total, falta) => total + (Number(falta) || 0), 0);
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
  let n1, n2, n3;
  let f1, f2, f3;

  if (Array.isArray(item.notas)) {
    n1 = normalizarNota(item.notas[0]);
    n2 = normalizarNota(item.notas[1]);
    n3 = normalizarNota(item.notas[2]);
  } else {
    n1 = normalizarNota(item.tri1);
    n2 = normalizarNota(item.tri2);
    n3 = normalizarNota(item.tri3);
  }

  if (Array.isArray(item.faltas)) {
    f1 = Number(item.faltas[0]) || 0;
    f2 = Number(item.faltas[1]) || 0;
    f3 = Number(item.faltas[2]) || 0;
  } else {
    f1 = 0;
    f2 = 0;
    f3 = 0;
  }

  const notas = [n1, n2, n3];
  const faltasArray = [f1, f2, f3];
  const media = calcularMedia(notas);
  const faltasTotal = somarFaltas(faltasArray);

  return {
    disciplina: item.disciplina,
    notas: notas,
    faltasArray: faltasArray,
    media: media,
    faltas: faltasTotal,
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
// 7. ATUALIZAR INTERFACE INTEGRAL
// ========================================

function atualizarTela(dadosBrutos) {
  const resultados = dadosBrutos.map(prepararDisciplina);
  preencherTabela(resultados);
  preencherCards(resultados);
}

// ========================================
// 8. AUTENTICAÇÃO E CONEXÃO COM A API
// ========================================

async function realizarLogin() {
  const campoPin = document.getElementById("campo-pin");
  const msgLogin = document.getElementById("mensagem-login");
  const btnEntrar = document.getElementById("btn-entrar");
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Por favor, informe o PIN.";
    msgLogin.className = "mensagem-status mensagem-erro";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "mensagem-status";
  btnEntrar.disabled = true;

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.className = "mensagem-status mensagem-erro";
      btnEntrar.disabled = false;
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.className = "mensagem-status mensagem-erro";
      btnEntrar.disabled = false;
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "mensagem-status mensagem-erro";
      btnEntrar.disabled = false;
      return;
    }

    const resultado = await resposta.json();
    pinSessao = pinDigitado;
    campoPin.value = "";

    if (resultado.dados === null || !resultado.dados.disciplinas || resultado.dados.disciplinas.length === 0) {
      dadosLocais = JSON.parse(JSON.stringify(disciplinas));
    } else {
      dadosLocais = resultado.dados.disciplinas;
    }

    document.getElementById("secao-login").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";
    atualizarTela(dadosLocais);

  } catch (erro) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.className = "mensagem-status mensagem-erro";
    btnEntrar.disabled = false;
  }
}

// ========================================
// 9. EDIÇÃO E VALIDAÇÕES
// ========================================

function abrirEdicao() {
  const corpoTabelaEdicao = document.getElementById("corpo-tabela-edicao");
  const msgEdicao = document.getElementById("mensagem-edicao");
  corpoTabelaEdicao.replaceChildren();
  msgEdicao.textContent = "";
  msgEdicao.className = "mensagem-status";

  const preparados = dadosLocais.map(prepararDisciplina);

  preparados.forEach((item, index) => {
    const linha = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = item.disciplina;
    linha.appendChild(tdNome);

    for (let i = 0; i < 3; i++) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.className = "input-edicao input-nota";
      input.dataset.index = index;
      input.dataset.tri = i;

      const val = item.notas[i];
      input.value = (val !== null && val !== undefined) ? String(val).replace(".", ",") : "";

      td.appendChild(input);
      linha.appendChild(td);
    }

    for (let i = 0; i < 3; i++) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.className = "input-edicao input-falta";
      input.dataset.index = index;
      input.dataset.tri = i;

      const val = item.faltasArray[i];
      input.value = (val !== undefined && val !== null) ? String(val) : "0";

      td.appendChild(input);
      linha.appendChild(td);
    }

    corpoTabelaEdicao.appendChild(linha);
  });

  document.getElementById("secao-edicao").style.display = "block";
  document.getElementById("secao-edicao").scrollIntoView({ behavior: "smooth" });
}

function fecharEdicao() {
  document.getElementById("secao-edicao").style.display = "none";
}

function validarNotaInput(texto) {
  const limpo = texto.trim();
  if (limpo === "") return { valido: true, valor: null };

  const normalizado = limpo.replace(",", ".");
  const num = Number(normalizado);

  if (!Number.isFinite(num)) return { valido: false };
  if (num < 0 || num > 10) return { valido: false };

  return { valido: true, valor: num };
}

function validarFaltaInput(texto) {
  const limpo = texto.trim();
  if (limpo === "") return { valido: false };

  const num = Number(limpo);
  if (!Number.isInteger(num) || num < 0) return { valido: false };

  return { valido: true, valor: num };
}

async function salvarAlteracoes() {
  const msgEdicao = document.getElementById("mensagem-edicao");
  const btnSalvar = document.getElementById("btn-salvar");
  msgEdicao.textContent = "";
  msgEdicao.className = "mensagem-status";

  const inputsNotas = document.querySelectorAll(".input-nota");
  const inputsFaltas = document.querySelectorAll(".input-falta");

  let possuiErro = false;

  inputsNotas.forEach(input => input.classList.remove("input-invalido"));
  inputsFaltas.forEach(input => input.classList.remove("input-invalido"));

  inputsNotas.forEach(input => {
    const res = validarNotaInput(input.value);
    if (!res.valido) {
      input.classList.add("input-invalido");
      possuiErro = true;
    }
  });

  inputsFaltas.forEach(input => {
    const res = validarFaltaInput(input.value);
    if (!res.valido) {
      input.classList.add("input-invalido");
      possuiErro = true;
    }
  });

  if (possuiErro) {
    msgEdicao.textContent = "Verifique os campos destacados em vermelho. Digite notas de 0 a 10 e faltas inteiras e positivas.";
    msgEdicao.className = "mensagem-status mensagem-erro";
    return;
  }

  const novasDisciplinas = JSON.parse(JSON.stringify(dadosLocais));

  inputsNotas.forEach(input => {
    const idx = Number(input.dataset.index);
    const tri = Number(input.dataset.tri);
    const res = validarNotaInput(input.value);

    if (!novasDisciplinas[idx].notas) {
      novasDisciplinas[idx].notas = [
        normalizarNota(novasDisciplinas[idx].tri1),
        normalizarNota(novasDisciplinas[idx].tri2),
        normalizarNota(novasDisciplinas[idx].tri3)
      ];
    }
    novasDisciplinas[idx].notas[tri] = res.valor;
  });

  inputsFaltas.forEach(input => {
    const idx = Number(input.dataset.index);
    const tri = Number(input.dataset.tri);
    const res = validarFaltaInput(input.value);

    if (!Array.isArray(novasDisciplinas[idx].faltas)) {
      novasDisciplinas[idx].faltas = [0, 0, 0];
    }
    novasDisciplinas[idx].faltas[tri] = res.valor;
  });

  msgEdicao.textContent = "Salvando...";
  msgEdicao.className = "mensagem-status";
  btnSalvar.disabled = true;

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgEdicao.textContent = "Erro ao salvar alterações na API. Tente novamente.";
      msgEdicao.className = "mensagem-status mensagem-erro";
      btnSalvar.disabled = false;
      return;
    }

    dadosLocais = novasDisciplinas;
    atualizarTela(dadosLocais);

    msgEdicao.textContent = "Dados salvos com sucesso.";
    msgEdicao.className = "mensagem-status mensagem-sucesso";

    setTimeout(() => {
      fecharEdicao();
      btnSalvar.disabled = false;
    }, 1200);

  } catch (erro) {
    msgEdicao.textContent = "Falha na conexão ao salvar. Tente novamente.";
    msgEdicao.className = "mensagem-status mensagem-erro";
    btnSalvar.disabled = false;
  }
}

// ========================================
// 10. INICIALIZAÇÃO E EVENTOS
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  const btnEntrar = document.getElementById("btn-entrar");
  const btnAlterar = document.getElementById("btn-alterar-dados");
  const btnSalvar = document.getElementById("btn-salvar");
  const btnCancelar = document.getElementById("btn-cancelar-edicao");
  const campoPin = document.getElementById("campo-pin");

  if (btnEntrar) btnEntrar.addEventListener("click", realizarLogin);
  if (campoPin) {
    campoPin.addEventListener("keypress", (e) => {
      if (e.key === "Enter") realizarLogin();
    });
  }

  if (btnAlterar) btnAlterar.addEventListener("click", abrirEdicao);
  if (btnSalvar) btnSalvar.addEventListener("click", salvarAlteracoes);
  if (btnCancelar) btnCancelar.addEventListener("click", fecharEdicao);
});