/* Cópia embutida de data/db.json, usada quando o navegador bloqueia fetch em file:// */
window.TF_DB = {
 "meta": {
  "nome": "TechFatec",
  "slogan": "Aprender. Conectar. Evoluir.",
  "hoje": "2026-11-25",
  "aviso": "Dados fictícios para demonstração."
 },
 "usuarios": [
  {
   "id": "u1",
   "perfil": "aluno",
   "nome": "Thiago Santos",
   "email": "thiago.santos@fatec.sp.gov.br",
   "senha": "demo123",
   "ra": "0000000000001",
   "curso": "Sistemas para Internet"
  },
  {
   "id": "u2",
   "perfil": "professor",
   "nome": "Camila Souza",
   "email": "camila.souza@fatec.sp.gov.br",
   "senha": "demo123",
   "matricula": "P-0001"
  }
 ],
 "disciplinas": [
  "Desenvolvimento Web",
  "Banco de Dados",
  "UX e Design de Interação",
  "Engenharia de Software"
 ],
 "grupos": [
  {
   "id": "g1",
   "nome": "Desenvolvimento Web",
   "disciplina": "Desenvolvimento Web",
   "professor": "Camila Souza",
   "status": "Em andamento",
   "encontro": "Terça-feira, das 19h às 21h30",
   "local": "Laboratório 4 · Bloco B",
   "descricao": "Grupo dedicado à prática de desenvolvimento web moderno, componentes, acessibilidade e construção colaborativa de projetos.",
   "topicos": [
    "React",
    "TypeScript",
    "Acessibilidade"
   ],
   "participantes": [
    {
     "nome": "Thiago Santos",
     "curso": "SI",
     "situacao": "Ativo"
    },
    {
     "nome": "Ana Lima",
     "curso": "SI",
     "situacao": "Ativo"
    },
    {
     "nome": "Bruno Martins",
     "curso": "SI",
     "situacao": "Ativo"
    },
    {
     "nome": "Larissa Costa",
     "curso": "SI",
     "situacao": "Convite pendente"
    }
   ],
   "materiais": [
    "m1",
    "m2"
   ]
  },
  {
   "id": "g2",
   "nome": "Banco de Dados",
   "disciplina": "Banco de Dados",
   "professor": "Marcos Lima",
   "status": "Em andamento",
   "encontro": "Quinta-feira, das 19h às 20h40",
   "local": "Laboratório 2 · Bloco A",
   "descricao": "Modelagem relacional, SQL e boas práticas de consulta, com exercícios em grupo.",
   "topicos": [
    "Modelagem",
    "SQL",
    "Índices"
   ],
   "participantes": [
    {
     "nome": "Carla Nunes",
     "curso": "SI",
     "situacao": "Ativo"
    },
    {
     "nome": "Pedro Alves",
     "curso": "SI",
     "situacao": "Ativo"
    }
   ],
   "materiais": [
    "m3"
   ]
  },
  {
   "id": "g3",
   "nome": "UX e Design de Interação",
   "disciplina": "UX e Design de Interação",
   "professor": "Renata Alves",
   "status": "Inscrições abertas",
   "encontro": "Sábado, das 9h às 11h",
   "local": "Sala 12 · Bloco C",
   "descricao": "Estudo de personas, jornadas, wireframes e prototipagem, com apresentação de resultados ao final do semestre.",
   "topicos": [
    "Personas",
    "Wireframes",
    "Prototipagem"
   ],
   "participantes": [
    {
     "nome": "Marina Rocha",
     "curso": "SI",
     "situacao": "Ativo"
    }
   ],
   "materiais": [
    "m4"
   ]
  },
  {
   "id": "g4",
   "nome": "Engenharia de Software",
   "disciplina": "Engenharia de Software",
   "professor": "Camila Souza",
   "status": "Inscrições abertas",
   "encontro": "Quarta-feira, das 19h às 20h40",
   "local": "Sala 7 · Bloco B",
   "descricao": "Requisitos, metodologias ágeis e documentação de projetos de software.",
   "topicos": [
    "Requisitos",
    "Scrum",
    "Documentação"
   ],
   "participantes": [
    {
     "nome": "Rafael Dias",
     "curso": "SI",
     "situacao": "Ativo"
    }
   ],
   "materiais": []
  }
 ],
 "membroDe": {
  "u1": [
   "g1"
  ]
 },
 "eventos": [
  {
   "id": "e1",
   "data": "2026-11-26",
   "hora": "19h00",
   "titulo": "Encontro do grupo Desenvolvimento Web",
   "grupo": "g1"
  },
  {
   "id": "e2",
   "data": "2026-11-30",
   "hora": "19h00",
   "titulo": "Revisão de projeto com a professora",
   "grupo": "g1"
  },
  {
   "id": "e3",
   "data": "2026-12-02",
   "hora": "19h00",
   "titulo": "Oficina de acessibilidade",
   "grupo": "g1"
  },
  {
   "id": "e4",
   "data": "2026-12-05",
   "hora": "09h00",
   "titulo": "Encontro de UX e Design de Interação",
   "grupo": "g3"
  },
  {
   "id": "e5",
   "data": "2026-12-09",
   "hora": "19h00",
   "titulo": "Apresentação parcial dos projetos",
   "grupo": "g1"
  }
 ],
 "materiais": [
  {
   "id": "m1",
   "titulo": "Introdução a componentes",
   "disciplina": "Desenvolvimento Web",
   "tipo": "PDF",
   "data": "2026-11-10",
   "descricao": "Conceitos de componentes, propriedades e estado, com exemplos comentados."
  },
  {
   "id": "m2",
   "titulo": "Guia de acessibilidade web",
   "disciplina": "Desenvolvimento Web",
   "tipo": "PDF",
   "data": "2026-11-14",
   "descricao": "Resumo dos princípios das WCAG 2.2 e verificações básicas de teclado e foco."
  },
  {
   "id": "m3",
   "titulo": "Exercícios de SQL",
   "disciplina": "Banco de Dados",
   "tipo": "DOCX",
   "data": "2026-11-12",
   "descricao": "Lista de exercícios sobre consultas com junções e agrupamentos."
  },
  {
   "id": "m4",
   "titulo": "Modelo de persona e jornada",
   "disciplina": "UX e Design de Interação",
   "tipo": "PPTX",
   "data": "2026-11-18",
   "descricao": "Modelos para a elaboração de personas e jornadas do usuário."
  }
 ],
 "atividades": [
  {
   "id": "a1",
   "titulo": "Protótipo navegável",
   "disciplina": "Desenvolvimento Web",
   "prazo": "2026-11-30",
   "hora": "23:59",
   "pontos": 10,
   "instrucoes": "Entregue o protótipo navegável do projeto, cobrindo os fluxos principais de acesso e navegação. Anexe o arquivo ou o link de acesso e descreva as decisões de design adotadas.",
   "entregas": [
    {
     "aluno": "Ana Lima",
     "arquivo": "prototipo-ana.pdf",
     "comentario": "Segue a entrega.",
     "nota": null,
     "retorno": ""
    },
    {
     "aluno": "Bruno Martins",
     "arquivo": "prototipo-bruno.zip",
     "comentario": "",
     "nota": 8.5,
     "retorno": "Boa organização dos fluxos."
    }
   ]
  },
  {
   "id": "a2",
   "titulo": "Modelo entidade-relacionamento",
   "disciplina": "Banco de Dados",
   "prazo": "2026-12-04",
   "hora": "23:59",
   "pontos": 10,
   "instrucoes": "Elabore o modelo entidade-relacionamento do estudo de caso e entregue em PDF.",
   "entregas": []
  },
  {
   "id": "a3",
   "titulo": "Relatório de acessibilidade",
   "disciplina": "Desenvolvimento Web",
   "prazo": "2026-12-09",
   "hora": "23:59",
   "pontos": 5,
   "instrucoes": "Avalie uma página escolhida com os critérios vistos em aula e registre os resultados.",
   "entregas": []
  },
  {
   "id": "a4",
   "titulo": "Persona do projeto",
   "disciplina": "UX e Design de Interação",
   "prazo": "2026-11-20",
   "hora": "23:59",
   "pontos": 5,
   "instrucoes": "Apresente a persona do projeto, com objetivos, necessidades e frustrações.",
   "entregas": [
    {
     "aluno": "Thiago Santos",
     "arquivo": "persona-thiago.pdf",
     "comentario": "Entrega dentro do prazo.",
     "nota": null,
     "retorno": ""
    }
   ]
  }
 ],
 "projetos": [
  {
   "id": "p1",
   "nome": "Plataforma de grupos de estudo",
   "grupo": "Desenvolvimento Web",
   "progresso": 60,
   "etapas": [
    {
     "nome": "Levantamento de requisitos",
     "feito": true
    },
    {
     "nome": "Wireframes e fluxos",
     "feito": true
    },
    {
     "nome": "Protótipo navegável",
     "feito": false
    },
    {
     "nome": "Apresentação final",
     "feito": false
    }
   ],
   "orientacoes": "Priorize a navegação e a acessibilidade. Registre as decisões de interface na documentação.",
   "equipe": [
    "Thiago Santos",
    "Ana Lima",
    "Bruno Martins"
   ]
  },
  {
   "id": "p2",
   "nome": "Modelagem do estudo de caso",
   "grupo": "Banco de Dados",
   "progresso": 30,
   "etapas": [
    {
     "nome": "Entrevista com o cliente fictício",
     "feito": true
    },
    {
     "nome": "Modelo conceitual",
     "feito": false
    },
    {
     "nome": "Modelo lógico",
     "feito": false
    }
   ],
   "orientacoes": "Entregue o modelo conceitual antes de avançar para o lógico.",
   "equipe": [
    "Carla Nunes",
    "Pedro Alves"
   ]
  },
  {
   "id": "p3",
   "nome": "Redesenho de um aplicativo acadêmico",
   "grupo": "UX e Design de Interação",
   "progresso": 10,
   "etapas": [
    {
     "nome": "Pesquisa de referências",
     "feito": true
    },
    {
     "nome": "Personas",
     "feito": false
    },
    {
     "nome": "Protótipo",
     "feito": false
    }
   ],
   "orientacoes": "Use apenas dados fictícios nas personas.",
   "equipe": [
    "Marina Rocha"
   ]
  }
 ],
 "videoaulas": [
  {
   "id": "v1",
   "titulo": "Arquitetura da informação",
   "disciplina": "UX e Design de Interação",
   "duracao": "18:20",
   "descricao": "Organização, rotulagem e navegação de conteúdos.",
   "transcricao": "Nesta aula, vamos entender como organizar conteúdos em sistemas de organização, rotulagem, navegação e busca.",
   "visivel": true
  },
  {
   "id": "v2",
   "titulo": "Componentes e estado",
   "disciplina": "Desenvolvimento Web",
   "duracao": "24:05",
   "descricao": "Como componentes recebem propriedades e guardam estado.",
   "transcricao": "Componentes são blocos de interface reutilizáveis. O estado guarda os dados que mudam ao longo do tempo.",
   "visivel": true
  },
  {
   "id": "v3",
   "titulo": "Consultas com junções",
   "disciplina": "Banco de Dados",
   "duracao": "21:40",
   "descricao": "Uso de INNER JOIN e LEFT JOIN em consultas.",
   "transcricao": "As junções combinam linhas de tabelas relacionadas a partir de uma condição.",
   "visivel": true
  }
 ],
 "agentes": [
  {
   "disciplina": "Desenvolvimento Web",
   "materiais": [
    "Introdução a componentes.pdf"
   ]
  },
  {
   "disciplina": "Banco de Dados",
   "materiais": []
  },
  {
   "disciplina": "UX e Design de Interação",
   "materiais": [
    "Modelo de persona e jornada.pptx"
   ]
  }
 ],
 "respostasAgente": {
  "resumir": "Resumo demonstrativo: o material apresenta os conceitos centrais da disciplina, com exemplos e uma lista de pontos de atenção.",
  "questoes": "Questões demonstrativas: 1) Qual é a diferença entre propriedades e estado? 2) Por que a acessibilidade deve ser considerada desde o início do projeto?",
  "explicar": "Explicação demonstrativa: o conceito é apresentado em linguagem simples, com um exemplo do dia a dia acadêmico.",
  "livre": "Resposta demonstrativa: este agente ainda não lê o conteúdo real dos arquivos."
 },
 "feedbacks": [],
 "notificacoes": {
  "aluno": [
   {
    "id": "n1",
    "texto": "Nova atividade em Desenvolvimento Web: Protótipo navegável.",
    "rota": "#/aluno/atividades/a1"
   },
   {
    "id": "n2",
    "texto": "Novo material publicado: Guia de acessibilidade web.",
    "rota": "#/aluno/materiais/m2"
   },
   {
    "id": "n3",
    "texto": "Encontro do grupo amanhã às 19h00.",
    "rota": "#/aluno/agenda"
   }
  ],
  "professor": [
   {
    "id": "n4",
    "texto": "2 entregas aguardam avaliação em Protótipo navegável.",
    "rota": "#/prof/atividades/a1"
   },
   {
    "id": "n5",
    "texto": "Um aluno aceitou o convite para Desenvolvimento Web.",
    "rota": "#/prof/grupos/g1"
   }
  ]
 },
 "relatorios": [
  {
   "disciplina": "Desenvolvimento Web",
   "periodo": "2026-2",
   "participacao": 82,
   "entregues": 14,
   "engajamento": 76
  },
  {
   "disciplina": "Banco de Dados",
   "periodo": "2026-2",
   "participacao": 74,
   "entregues": 9,
   "engajamento": 68
  },
  {
   "disciplina": "UX e Design de Interação",
   "periodo": "2026-2",
   "participacao": 88,
   "entregues": 11,
   "engajamento": 81
  },
  {
   "disciplina": "Desenvolvimento Web",
   "periodo": "2026-1",
   "participacao": 79,
   "entregues": 12,
   "engajamento": 70
  },
  {
   "disciplina": "Banco de Dados",
   "periodo": "2026-1",
   "participacao": 71,
   "entregues": 10,
   "engajamento": 66
  }
 ],
 "faq": [
  {
   "p": "Como entrego uma atividade?",
   "r": "Abra Atividades, escolha a atividade, anexe o arquivo, escreva um comentário opcional e envie."
  },
  {
   "p": "Como saio de um grupo?",
   "r": "Em Explorar grupos, abra o grupo e use Sair do grupo. Uma janela pedirá a confirmação."
  },
  {
   "p": "Como altero o tamanho do texto?",
   "r": "Use o botão A, no canto da tela, para aumentar ou reduzir a fonte e ativar o alto contraste."
  },
  {
   "p": "Como volto ao início?",
   "r": "Clique no logotipo TechFatec no menu lateral ou use o caminho de navegação no topo da tela."
  }
 ]
};
