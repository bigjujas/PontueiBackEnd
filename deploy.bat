@echo off
echo Fazendo deploy do backend...
git add .
git commit -m "feat: adicionar rotas de produtos"
git push origin main
echo Deploy concluido!
pause