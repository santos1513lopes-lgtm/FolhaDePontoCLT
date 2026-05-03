# 📋 Gerenciador de Folha de Ponto CLT

Este é um aplicativo web simples, moderno e funcional para controle de jornada de trabalho e banco de horas, totalmente alinhado com as regras da CLT brasileira. 

O projeto foi desenvolvido para facilitar o registro diário de entradas e saídas, permitindo a visualização tanto semanal quanto mensal dos saldos de horas.

---

## ✨ Funcionalidades

- **Dual View (Semana/Mês):** Alterne entre a visão semanal (foco em 44h) e mensal (foco em 220h).
- **Cálculo Automático:** Calcula as horas líquidas trabalhadas descontando o intervalo de almoço.
- **Gestão de Feriados e Atestados:** Opção para marcar dias como feriado ou abono, compensando automaticamente a jornada diária para não negativar o banco de horas.
- **Horas Extras 100%:** Identifica automaticamente horas trabalhadas em feriados ou domingos e as contabiliza separadamente.
- **Persistência de Dados:** Todos os dados são salvos no `localStorage` do seu navegador. Você pode fechar a aba e voltar depois sem perder nada.
- **Importação e Exportação CSV:** Salve backups dos seus dados em arquivos Excel (CSV) e recupere-os quando quiser.
- **Relatório para Impressão:** Design otimizado para impressão, ocultando botões e menus desnecessários no papel.

---

## 🚀 Como Usar (Tutorial)

1. **Configuração Inicial:**
   - No topo da página, digite seu **Nome Completo**.
   - Defina sua **Jornada Diária** (padrão 08:00). Esse valor será usado para calcular os abonos de feriados.
   - Ajuste a **Carga Horária Base** se necessário (44h para semanas ou 220h para meses).

2. **Registrando as Horas:**
   - Selecione a semana ou o mês que deseja preencher.
   - Digite os horários de **Entrada, Saída Almoço, Retorno Almoço e Saída Final**.
   - O sistema calculará o total do dia e o saldo do período em tempo real.

3. **Feriados, Domingos ou Atestados:**
   - Se for um dia de folga (feriado ou atestado), marque a caixa na coluna **Feriado / Atestado**.
   - Se deixar os horários em branco, o sistema dará "Abono" (contando as horas como trabalhadas para o saldo).
   - Se você trabalhar nesse dia, o sistema contará essas horas como **Horas 100%**.

4. **Salvando e Exportando:**
   - Os dados salvam sozinhos enquanto você digita.
   - Use o botão **Exportar CSV** para baixar um backup no seu PC.
   - Use o botão **Importar CSV** para carregar um arquivo de backup salvo anteriormente.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5:** Estruturação dos dados e tabelas.
- **CSS3:** Design responsivo e estilização estilo Dashboard.
- **JavaScript (Vanilla):** Lógica de cálculos, manipulação de datas e persistência de dados.

---

## 👨‍💻 Autor

Desenvolvido por **Josué Lopes** durante o aprendizado de programação e ferramentas de IA.