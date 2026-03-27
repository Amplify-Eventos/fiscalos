const fs = require('fs');

let code = fs.readFileSync('lib/digital-twin.ts', 'utf8');

const oldBlock = `
    // Verificar restrições do MEI
    if (this.empresa.naturezaJuridica === "MEI" && receita > LIMITES.MEI) {
      restricoes.push("MEI excede limite de faturamento");
      viavel = false;
    }`;

// Since the text might have weird characters due to encoding, let's regex it
const finalCode = code.replace(/if \(this\.empresa\.naturezaJuridica === "MEI" && receita > LIMITES\.MEI\) \{\s*restricoes\.push\([^)]+\);\s*viavel = false;\s*\}/, `if (this.empresa.naturezaJuridica === "MEI" && receita > LIMITES.MEI) {
      restricoes.push("Necessário desenquadramento do MEI.");
    }`);

fs.writeFileSync('lib/digital-twin.ts', finalCode);
console.log('Fixed MEI logic.');
