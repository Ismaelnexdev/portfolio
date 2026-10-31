---
title: "O erro que afinal não era meu"
date: 2026-10-30
kind: aprendizagem
summary: "Uma extensão do navegador alterava as cores do meu site e fazia o Next.js queixar-se."
---

Durante dias vi o Next.js queixar-se de uma diferença entre o HTML do servidor e o do navegador, e as cores do meu painel apareciam acinzentadas.

A causa era uma extensão do navegador (o Dark Reader), que altera a página antes de o React a carregar. Numa janela anónima, sem extensões, as cores estavam certas.

Fica a regra: antes de mexer no código, testar numa janela anónima.
