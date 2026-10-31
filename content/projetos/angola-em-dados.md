---
title: "Angola em dados"
date: 2026-10-29
summary: "Painel interativo com indicadores públicos do Banco Mundial sobre Angola e a comparação com os países vizinhos."
stack:
  - Next.js
  - TypeScript
  - Recharts
  - Motion
  - Tailwind CSS
  - Vitest
demo: https://angola-em-dados.vercel.app
repo: https://github.com/Ismaelnexdev/angola-em-dados
featured: true
---

## O problema

Os números sobre Angola estão espalhados por muitos sítios, e é difícil ver como o país evolui e como se compara com os vizinhos.

## O que faz

Mostra 9 indicadores, cada um com o último valor, o ano a que pertence e uma mini-linha da evolução. Cada indicador tem um gráfico de 10 anos, 20 anos ou de todo o histórico, e podes juntar até 3 países a Angola. Umas barras mostram a posição de Angola entre os países comparados.

## Decisões técnicas

- Os dados são pedidos no servidor, com cache de 24 horas, e a página é regenerada de hora a hora, por isso uma falha da API corrige-se sozinha.
- O cliente de dados tenta de novo em falhas de rede e está testado com respostas simuladas. Se um indicador falha, só essa linha mostra o aviso.
- Os dados do Banco Mundial têm atraso, por isso o ano aparece sempre ao lado do valor.
- Cada país no gráfico tem um traço diferente, para se distinguirem mesmo sem ver cores.

## Limitações

Só usa o Banco Mundial, compara com 6 países e tem apenas tema claro.
