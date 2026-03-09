export interface Contrat {
    id: string;
    configuration_id: string;
    type_contrat: string;
    maison_id: string;
    locataire_id: string;
    parcelle_id: string;
    date_de_debut: string;
    date_de_fin: string;
    renouvelable: boolean;
    montant_mensuel: number;
    nombre_de_mois_de_caution: number;
    montant_caution: number;
    nombre_de_mois_d_avance: number;
    montant_avance_de_loyer: number;
    status: string;
    description: string;
    nom_de_la_personne_a_contacter: string;
    prenom_de_la_personne_a_contacter: string;
    numero_cni_de_la_personne_a_contacter: string;
    telephone_de_la_personne_a_contacter: string;
    lieu_de_residence_de_la_personne_a_contacter: string;
}
