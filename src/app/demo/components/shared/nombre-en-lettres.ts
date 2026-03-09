export function nombreEnLettres(nombre: number): string {
    if (nombre === 0) {
      return "zéro";
    }

    const unites = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
    const dizainesSpeciales = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const dizaines = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];
    const centaines = ["", "cent", "deux cents", "trois cents", "quatre cents", "cinq cents", "six cents", "sept cents", "huit cents", "neuf cents"];
    const milliers = ["", "mille", "million", "milliard", "trillion"];

    function convertirTranche(n: number): string {
      if (n === 0) {
        return "";
      } else if (n < 10) {
        return unites[n];
      } else if (n < 20) {
        return dizainesSpeciales[n - 10];
      } else if (n < 100) {
        const unite = n % 10;
        const dizaine = Math.floor(n / 10);
        let resultat = dizaines[dizaine];
        if (unite > 0) {
          resultat += (dizaine === 7 || dizaine === 9) ? "-" + dizainesSpeciales[unite + (dizaine === 7 ? 0 : 10)] : (unite === 1 && dizaine > 1) ? "-et-un" : "-" + unites[unite];
        }
        return resultat;
      } else {
        const centaine = Math.floor(n / 100);
        const reste = n % 100;
        let resultat = centaines[centaine];
        if (reste > 0) {
          resultat += " " + convertirTranche(reste);
        }
        return resultat;
      }
    }

    if (nombre < 1000) {
      return convertirTranche(nombre);
    }

    let i = 1;
    let resultatFinal = "";
    while (nombre > 0) {
      const tranche = nombre % 1000;
      if (tranche > 0) {
        const nomTranche = convertirTranche(tranche);
        resultatFinal = (i > 1 && tranche > 1) ? nomTranche + " " + milliers[i] + (tranche > 1 ? "s" : "") + (resultatFinal ? " " + resultatFinal : "") : nomTranche + " " + milliers[i] + (resultatFinal ? " " + resultatFinal : "");
      }
      nombre = Math.floor(nombre / 1000);
      i++;
    }

    return resultatFinal.trim();
  }