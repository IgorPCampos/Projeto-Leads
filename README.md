# API Frete & Leads

API RESTful desenvolvida em **NestJS** para gerenciamento de intenções de frete e captação de leads. O sistema permite validar a viabilidade de fretes entre CEPs de origem e destino.

## Tecnologias

- **Node.js** & **NestJS** - Framework principal.
- **TypeORM** - ORM para manipulação do banco de dados.
- **PostgreSQL (NeonDB)** - Banco de dados relacional serverless.
- **Swagger** - Documentação automática da API.
- **Jest** & **Supertest** - Testes Unitários e E2E.
- **Nodemailer** - Envio de e-mails transacionais.
- **ViaCEP** - Integração para validação de endereços.

---

## Configuração e Instalação

# Clone o repositório
git clone https://github.com/IgorPCampos/Projeto-Leads
cd Projeto-Leads

# Instalar dependências
npm install

# Configurações
Crie um .env na raiz do projeto
Copie o .env.example e siga as instruções para substituir as variáveis corretamente

# Rodar projeto
npm run start:dev

# Rodar testes unitários e teste E2E
npm run test
npm run test:e2e

# Documentação
http://localhost:3000/docs