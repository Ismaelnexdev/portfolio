---
title: "Calculadora de IRT"
date: 2026-10-27
summary: "Calcula o salário líquido em Angola a partir do salário base e dos subsídios, com IRT, Segurança Social e a conta passo a passo."
stack:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - Vitest
  - GitHub Actions
demo: https://calculadora-irt-angola.vercel.app
repo: https://github.com/Ismaelnexdev/calculadora-irt-angola
featured: true
---

## O problema

Quem recebe um salário em Angola quer saber quanto lhe fica depois do IRT e da Segurança Social, mas a conta tem 11 escalões e é difícil de fazer de cabeça.

## O que faz

Escreves o salário base e os subsídios, e a calculadora mostra o salário líquido, quanto vai para o IRT e para a Segurança Social, o escalão aplicado e a conta passo a passo. Tem tema claro e escuro e funciona bem no telemóvel.

## Decisões técnicas

- A lógica fiscal está separada da interface e tem testes, incluindo um exemplo divulgado pela AGT: 175 000 Kz de matéria colectável dão 16 500 Kz de IRT.
- As tabelas são dados com data de vigência. Receber o IRPS, previsto para 2027, é acrescentar uma tabela, sem reescrever as funções de cálculo.
- A base de incidência da Segurança Social é uma opção do utilizador, porque as fontes consultadas divergem.

## Limitações

Só cobre o Grupo A (trabalho por conta de outrem), e os valores são indicativos.
