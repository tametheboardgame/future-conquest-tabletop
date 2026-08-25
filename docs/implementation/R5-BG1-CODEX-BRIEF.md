# R5-BG1 Implementation Brief

Implement the R5 board-game rules authority boundary on top of accepted BG0.

Required outcomes:
- six permanent command seats, three Future and three Coalition;
- controller assignment separate from command identity;
- eight-round deterministic campaign state;
- formation ownership assigned to command seats;
- deterministic alternating side/command activation;
- save/resume preserves the six-seat shape;
- portal and strategic objectives represented in R5 state;
- R3 rich-map renderer remains a one-way presentation adapter only;
- no restoration of legacy simulation authority;
- no command dice, cards, escalation, mobilisation, multiplayer UI or AI decision logic in BG1.

Temporary compatibility rule:
- preserve the existing four-actions-per-side prototype capacity until BG2;
- distribute it 2/1/1 across each side's command seats so BG1 does not change force capacity while establishing the final command topology.

Validation:
- full `npm test`;
- `npm run test:r5`;
- TypeScript build/typecheck;
- production build;
- existing BG0 rich-map runtime gate must remain green.
