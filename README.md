# 🌐 Prática Vortex — Sistema de Cadastro, Login e Indicação (SPA + API)

Este projeto foi desenvolvido como parte de uma prática de processo seletivo da **Vortex - UNIFOR**.  
Ele consiste em uma aplicação web com **autenticação de usuários**, **códigos de indicação**, **roteamento em SPA (Single Page Application)** e um **back-end em Node.js + SQLite**.

---

## ✨ **Principais Funcionalidades**

- ✅ **Cadastro de Usuário** com geração automática de código de indicação único.  
- ✅ **Registro com código de indicação** (referral), somando pontos para o usuário que indicou.  
- ✅ **Login com autenticação**, armazenando a sessão localmente.  
- ✅ **Dashboard protegido**, acessível apenas a usuários logados.  
- ✅ **Validação da sessão** via `/me` no back-end, prevenindo loops de redirecionamento.  
- ✅ **SPA**, permitindo navegação entre Login, Cadastro e Dashboard sem recarregar a página.  
- ✅ **Cópia do link de indicação** direto no dashboard com clique no ícone.  
- ✅ **Interface estilizada** com campos responsivos focando na experiêcia do usuário.

---

## 🧠 **Arquitetura do Projeto**

```
pratica-vortex/
├── backend/
│   ├── server.js              # Servidor Node.js + Express + SQLite
│   ├── database.sqlite        # Banco SQLite gerado automaticamente
│   └── package.json
├── src/
│   ├── api.js                 # Comunicação com a API via fetch
│   ├── router.js              # Sistema de rotas SPA + guardas
│   ├── store.js               # Controle de sessão/localStorage
│   ├── app.js                 # Inicialização geral
│   └── views/
│       ├── login.view.html
│       ├── register.view.html
│       └── dashboard.view.html
├── styles/
│   └── css/style.css          # Estilo principal do front-end
├── index.html                 # Página principal SPA
└── README.md
```

---

## 🛠️ **Tecnologias Utilizadas**

| Tecnologia              | Função no Projeto                                                                 |
|--------------------------|------------------------------------------------------------------------------------|
| **Node.js + Express**    | Criação da API REST para login, cadastro, `/me`, logout                            |
| **SQLite**              | Banco de dados leve para armazenar usuários e pontuação                            |
| **HTML / CSS**          | Estrutura e estilo das páginas do front-end                                        |
| **JavaScript (Vanilla)** | SPA, roteamento, integração com API e gerenciamento de sessão                      |
| **Fetch API**           | Comunicação assíncrona entre front e back                                          |
| **LocalStorage**        | Armazenamento do ID do usuário para simular sessão local                           |

### 📌 Por que essas tecnologias?

- **Node + SQLite** → simples, leve e não exige servidor externo para rodar como outros db's.  
- **Vanilla JS + SPA** → tecnologia que estou aprendendo e tentando me aprofundar cada vez mais.  
- **Fetch API** → nativo no navegador, sem dependências extras.  
- **LocalStorage** → facilita simular sessões sem JWT em ambiente de prática.

---

## 📦 **Dependências do Back-end**

Antes de rodar o sistema, certifique-se de instalar estas dependências no diretório `/backend`:

```bash
npm install express cors sqlite3
npm install --save-dev nodemon
```

---

## 🚀 **Como Executar o Projeto Localmente**

### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/brenosampdev/PraticaVortex.git
cd PraticaVortex
```

### 2️⃣ Configurar o Back-end
Entre na pasta do backend:
```bash
cd backend
```

Crie (ou edite) o `package.json` para conter:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Instale as dependências:
```bash
npm install
```

### 3️⃣ Iniciar o servidor
```bash
npm start
```
> A API estará disponível em: [http://localhost:3000](http://localhost:3000)

### 4️⃣ Rodar o Front-end
Volte para a pasta raiz e abra o arquivo `index.html` no navegador.  
Ou use a extensão **Live Server** do VS Code.

> ⚠ Se você quiser resetar os dados, basta **deletar o arquivo `database.sqlite`** e reiniciar o servidor.

---

## 🌐 **Rotas da API**

| Método | Rota                | Descrição                                      |
|--------|-----------------------|-----------------------------------------------|
| POST   | `/register`          | Cria um novo usuário (com ou sem código ref)   |
| POST   | `/login`             | Autentica usuário por email ou nome + senha   |
| GET    | `/me/:id`           | Retorna dados do usuário autenticado         |
| POST   | `/logout`            | Encerra a sessão atual                        |

---

## 🧪 **Fluxo de Indicação**

1. Usuário A se cadastra → recebe um código de indicação único.  
2. Usuário B acessa o link de convite:  
   ```
   http://127.0.0.1:5500/index.html#/register?ref=CODIGO
   ```
3. Ao se registrar com esse link, B é cadastrado normalmente e **A ganha +1 ponto**, armazenado no banco SQLite.  
4. Esse total aparece automaticamente no Dashboard.

---

## 🦾 **Feito a mão**

Front-end inteiro foi feito do zero e sem auxilio de nenhuma IA:

- Efeitos de box shadow.
- Ajuste automático de tamanho de items utilizando media queries.  
- Utilização de pseudo-classes do css (hover, focus, active e afins).  
- Acessibilidade para todos os usuários utilizando propiedade aria-hidden.
- Criação das páginas HTML (login.view.html, register.view.html, dashboard.view.html)
- Estrutura dos formulários, campos de entrada e botões
- Toda a identidade visual, cores, sombras, tipografia e espaçamentos foram definidos manualmente e com autoria própia.
- Ajustes finos no comportamento visual de botões, inputs e responsividade.
- Criação dos efeitos de hover, transições e botões interativos (ex: animação no hover da navegação).
- Nenhuma biblioteca CSS externa foi usada (como Tailwind ou Bootstrap), mantendo o controle total sobre o design.

---
## 🤖 **Colaboração com IA**

Este projeto foi desenvolvido com suporte direto de **ChatGPT (GPT-5)**, que auxiliou em:

- Planejamento da estrutura de pastas e roteamento SPA.  
- Implementação da API REST com Express + SQLite.  
- Depuração dos fluxos de login e redirecionamento.  
- Criação de guards de rota e prevenção de loops de sessão.  
- Ajuste dinâmico do header com botão de Logout.  
- Criação de README.md com todas as ajudas prestadas a mim em relação ao back-end.  

### 🧠 O que aprendi
- Como estruturar um projeto **front + back** simples sem frameworks.  
- Como usar **SQLite** com Node.js de forma prática.  
- Implementar **SPA**.  
- Corrigir erros reais de fluxo de autenticação e roteamento.  

---

## 👨‍💻 **Autor**

Desenvolvido por **Breno Sampaio**  
📅 Outubro de 2025  
📝 Atividade Prática — Vortex (UNIFOR)
