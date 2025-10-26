# Pontuei Backend API

API completa e robusta para o aplicativo "Pontuei" desenvolvida com **NestJS**, **TypeScript**, **Prisma** e **PostgreSQL**.

## 🚀 Tecnologias Utilizadas

- **NestJS** - Framework Node.js para aplicações escaláveis
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Prisma** - ORM moderno para TypeScript e Node.js
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação baseada em tokens
- **bcrypt** - Hashing de senhas
- **Swagger** - Documentação da API
- **class-validator** - Validação de dados
- **class-transformer** - Transformação de objetos

## 📋 Funcionalidades

### 🔐 Autenticação e Clientes
- **POST /auth/register** - Registro de novos clientes
- **POST /auth/login** - Login com JWT
- **GET /clients/me** - Perfil do cliente logado
- **PUT /clients/me** - Atualização do perfil

### 🏪 Estabelecimentos
- **GET /establishments** - Lista todos os estabelecimentos (com filtros)
- **GET /establishments/:id** - Detalhes de um estabelecimento
- **GET /establishments/my-store** - Estabelecimento do dono logado
- **PUT /establishments/my-store** - Atualizar estabelecimento
- **POST /establishments/my-store/products** - Criar produto
- **PUT /establishments/my-store/products/:id** - Atualizar produto
- **DELETE /establishments/my-store/products/:id** - Deletar produto

### 🛒 Pedidos e Transações
- **POST /orders** - Criar novo pedido (com transação atômica)
- **GET /orders/me** - Histórico de pedidos do cliente
- **GET /orders/my-store** - Pedidos recebidos pelo estabelecimento
- **PUT /orders/:id/status** - Atualizar status do pedido
- **POST /orders/:id/payment** - Registrar pagamento
- **POST /orders/:id/complete** - Finalizar pedido e conceder pontos

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- PostgreSQL (versão 13 ou superior)
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <repository-url>
cd pontuei-backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/pontuei_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 4. Configure o banco de dados
```bash
# Gerar o cliente Prisma
npm run prisma:generate

# Executar as migrações
npm run prisma:migrate

# (Opcional) Popular o banco com dados de exemplo
npm run prisma:seed
```

### 5. Execute a aplicação
```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

## 📚 Documentação da API

Após iniciar a aplicação, acesse a documentação Swagger em:
- **http://localhost:3080/api**

## 🔒 Segurança

### Guards Implementados
- **JwtAuthGuard** - Protege rotas que requerem autenticação
- **OwnerGuard** - Protege rotas que requerem ser dono de estabelecimento

### Validação de Dados
- Todos os endpoints utilizam **Pipes** para validação de entrada
- Validação automática com **class-validator**
- Sanitização de dados com **class-transformer**

## 💰 Sistema de Pontos

### Cálculo de Pontos
- **1 ponto a cada R$10,00** gastos
- Pontos são concedidos apenas quando o pedido é **finalizado**
- Transação atômica garante consistência dos dados

### Transações Críticas
A finalização de pedidos utiliza **transações do Prisma** para garantir:
1. Atualização do status do pedido
2. Adição de pontos ao saldo do cliente
3. Criação do registro de transação de pontos

## 🏗️ Arquitetura

### Estrutura Modular
```
src/
├── auth/           # Módulo de autenticação
├── clients/        # Módulo de clientes
├── establishments/ # Módulo de estabelecimentos
├── orders/         # Módulo de pedidos
├── prisma/         # Configuração do Prisma
├── common/         # Utilitários compartilhados
└── main.ts         # Ponto de entrada da aplicação
```

### Padrões Utilizados
- **Módulos** para organização
- **Controladores** para endpoints REST
- **Serviços** para lógica de negócio
- **DTOs** para validação de dados
- **Guards** para autorização
- **Pipes** para transformação de dados

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 📝 Scripts Disponíveis

```bash
npm run build          # Compilar TypeScript
npm run start          # Iniciar aplicação
npm run start:dev      # Iniciar em modo desenvolvimento
npm run start:debug    # Iniciar em modo debug
npm run start:prod     # Iniciar em modo produção
npm run lint           # Executar linter
npm run format         # Formatar código
npm run prisma:generate # Gerar cliente Prisma
npm run prisma:migrate  # Executar migrações
npm run prisma:studio   # Abrir Prisma Studio
npm run prisma:seed     # Popular banco com dados de exemplo
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para dúvidas ou problemas, abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.
