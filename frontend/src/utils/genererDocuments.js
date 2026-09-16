import jsPDF from 'jspdf'
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  VerticalAlign,
} from 'docx'


// =====================================================
// NETTOYER UN NOM POUR LE NOM DU FICHIER
// =====================================================

function nettoyerNom(nom = '') {
  return nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}


// =====================================================
// VALEUR SÉCURISÉE
// =====================================================

function valeur(value) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return 'Non renseigné'
  }

  return String(value)
}


// =====================================================
// NOM DU FICHIER
// =====================================================

function nomFichier(preparation, extension) {

  const enseignant = nettoyerNom(
    preparation.enseignant_nom || 'Enseignant'
  )

  const classe = nettoyerNom(
    preparation.classe_nom || 'Classe'
  )

  return `Preparation_${enseignant}_${classe}.${extension}`
}


// =====================================================
// TITRE DU DOCUMENT
// =====================================================

function titreDocument(preparation) {

  return (
    preparation.sujet ||
    preparation.titre ||
    'Préparation de leçon'
  )
}


// =====================================================
// GÉNÉRER PDF
// =====================================================

export function genererPDF(preparation) {

  if (!preparation) {
    throw new Error(
      'Aucune préparation à exporter.'
    )
  }

  if (preparation.statut !== 'valide') {
    throw new Error(
      'La préparation doit être validée avant de générer le PDF.'
    )
  }


  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  })


  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  const marge = 15
  const largeur = pageWidth - marge * 2

  let y = 15


  // ===================================================
  // EN-TÊTE
  // ===================================================

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)

  pdf.text(
    'KALEBUKA SHALOOM',
    pageWidth / 2,
    y,
    { align: 'center' }
  )

  y += 7

  pdf.setFontSize(13)

  pdf.text(
    'FICHE DE PRÉPARATION DE LEÇON',
    pageWidth / 2,
    y,
    { align: 'center' }
  )

  y += 5


  // ligne
  pdf.setLineWidth(0.5)

  pdf.line(
    marge,
    y,
    pageWidth - marge,
    y
  )

  y += 9


  // ===================================================
  // INFORMATIONS ENSEIGNANT
  // ===================================================

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'bold')

  pdf.text(
    'INFORMATIONS GÉNÉRALES',
    marge,
    y
  )

  y += 7

  pdf.setFontSize(9)

  const informations = [
    [
      'Enseignant',
      valeur(preparation.enseignant_nom),
      'Matricule',
      valeur(preparation.enseignant_matricule),
    ],
    [
      'Section',
      valeur(preparation.section),
      'Classe',
      valeur(preparation.classe_nom),
    ],
    [
      'Branche',
      valeur(preparation.branche),
      'Sous-branche',
      valeur(preparation.sous_branche),
    ],
    [
      'Jour',
      valeur(preparation.jour),
      'Date',
      valeur(preparation.date_lecon),
    ],
    [
      'Heure',
      `${valeur(preparation.heure_debut)} - ${valeur(preparation.heure_fin)}`,
      'Fiche N°',
      valeur(preparation.fiche_numero),
    ],
  ]


  informations.forEach((ligne) => {

    const hauteur = 8

    pdf.setFont('helvetica', 'bold')

    pdf.text(
      `${ligne[0]} :`,
      marge,
      y
    )

    pdf.setFont('helvetica', 'normal')

    pdf.text(
      ligne[1],
      marge + 27,
      y
    )

    pdf.setFont('helvetica', 'bold')

    pdf.text(
      `${ligne[2]} :`,
      marge + 95,
      y
    )

    pdf.setFont('helvetica', 'normal')

    const texte = pdf.splitTextToSize(
      ligne[3],
      65
    )

    pdf.text(
      texte,
      marge + 122,
      y
    )

    y += hauteur
  })


  y += 4


  // ===================================================
  // INFORMATIONS PÉDAGOGIQUES
  // ===================================================

  ajouterTitrePDF(
    pdf,
    'INFORMATIONS PÉDAGOGIQUES',
    marge,
    y
  )

  y += 8


  y = ajouterChampPDF(
    pdf,
    'Sujet',
    preparation.sujet,
    marge,
    y,
    largeur
  )

  y = ajouterChampPDF(
    pdf,
    'Matériel didactique',
    preparation.materiel_didactique,
    marge,
    y,
    largeur
  )

  y = ajouterChampPDF(
    pdf,
    'Référence',
    preparation.reference,
    marge,
    y,
    largeur
  )

  y = ajouterChampPDF(
    pdf,
    'Objectif opérationnel',
    preparation.objectif_operationnel,
    marge,
    y,
    largeur
  )


  // ===================================================
  // DÉROULEMENT
  // ===================================================

  y = nouvellePageSiNecessaire(
    pdf,
    y,
    45
  )

  ajouterTitrePDF(
    pdf,
    'DÉROULEMENT DE LA LEÇON',
    marge,
    y
  )

  y += 8


  const etapes = [
    {
      titre: 'Rappel',
      enseignant: preparation.rappel_enseignant,
      apprenants: preparation.rappel_apprenants,
    },
    {
      titre: 'Motivation',
      enseignant: preparation.motivation_enseignant,
      apprenants: preparation.motivation_apprenants,
    },
    {
      titre: 'Annonce du sujet',
      enseignant: preparation.annonce_enseignant,
      apprenants: preparation.annonce_apprenants,
    },
    {
      titre: 'Analyse',
      enseignant: preparation.analyse_enseignant,
      apprenants: preparation.analyse_apprenants,
    },
    {
      titre: 'Synthèse',
      enseignant: preparation.synthese_enseignant,
      apprenants: preparation.synthese_apprenants,
    },
  ]


  etapes.forEach((etape, index) => {

    y = nouvellePageSiNecessaire(
      pdf,
      y,
      35
    )

    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(10)

    pdf.text(
      `${index + 1}. ${etape.titre}`,
      marge,
      y
    )

    y += 6

    y = ajouterChampPDF(
      pdf,
      'Enseignant',
      etape.enseignant,
      marge,
      y,
      largeur
    )

    y = ajouterChampPDF(
      pdf,
      'Apprenants',
      etape.apprenants,
      marge,
      y,
      largeur
    )

    y += 3
  })


  // ===================================================
  // QUESTIONS FINALES
  // ===================================================

  y = nouvellePageSiNecessaire(
    pdf,
    y,
    45
  )

  ajouterTitrePDF(
    pdf,
    'QUESTIONS FINALES',
    marge,
    y
  )

  y += 8

  y = ajouterChampPDF(
    pdf,
    'Questions',
    preparation.questions_finales,
    marge,
    y,
    largeur
  )

  y = ajouterChampPDF(
    pdf,
    'Réponses',
    preparation.reponses_finales,
    marge,
    y,
    largeur
  )


  // ===================================================
  // VALIDATION
  // ===================================================

  y = nouvellePageSiNecessaire(
    pdf,
    y,
    55
  )

  ajouterTitrePDF(
    pdf,
    'VALIDATION DE LA DIRECTION',
    marge,
    y
  )

  y += 9

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)

  pdf.text(
    'Cette préparation a été validée par la Direction.',
    marge,
    y
  )

  y += 7

  if (preparation.date_validation) {

    pdf.text(
      `Date de validation : ${new Date(
        preparation.date_validation
      ).toLocaleString('fr-FR')}`,
      marge,
      y
    )

  }

  y += 18

  pdf.setFont('helvetica', 'bold')

  pdf.text(
    'Signature de l\'enseignant',
    marge + 10,
    y
  )

  pdf.text(
    'Visa de la Direction',
    pageWidth - marge - 65,
    y
  )


  // ===================================================
  // PIED DE PAGE
  // ===================================================

  ajouterPiedDePage(
    pdf,
    pageWidth,
    pageHeight
  )


  // ===================================================
  // TÉLÉCHARGEMENT DIRECT
  // ===================================================

  pdf.save(
    nomFichier(preparation, 'pdf')
  )
}


// =====================================================
// GÉNÉRER WORD
// =====================================================

export async function genererWord(preparation) {

  if (!preparation) {
    throw new Error(
      'Aucune préparation à exporter.'
    )
  }

  if (preparation.statut !== 'valide') {
    throw new Error(
      'La préparation doit être validée avant de générer le document Word.'
    )
  }


  const bordures = {
    top: {
      style: BorderStyle.SINGLE,
      size: 1,
    },
    bottom: {
      style: BorderStyle.SINGLE,
      size: 1,
    },
    left: {
      style: BorderStyle.SINGLE,
      size: 1,
    },
    right: {
      style: BorderStyle.SINGLE,
      size: 1,
    },
  }


  const document = new Document({

    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 720,
              bottom: 720,
              left: 720,
              right: 720,
            },
          },
        },

        children: [

          // ==========================================
          // TITRE
          // ==========================================

          new Paragraph({
            alignment: AlignmentType.CENTER,

            children: [
              new TextRun({
                text: 'KALEBUKA SHALOOM',
                bold: true,
                size: 30,
              }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,

            spacing: {
              after: 200,
            },

            children: [
              new TextRun({
                text: 'FICHE DE PRÉPARATION DE LEÇON',
                bold: true,
                size: 24,
              }),
            ],
          }),


          // ==========================================
          // INFORMATIONS GÉNÉRALES
          // ==========================================

          titreWord(
            'INFORMATIONS GÉNÉRALES'
          ),

          tableauInformationsWord(
            [
              ['Enseignant', preparation.enseignant_nom],
              ['Matricule', preparation.enseignant_matricule],
              ['Section', preparation.section],
              ['Classe', preparation.classe_nom],
              ['Branche', preparation.branche],
              ['Sous-branche', preparation.sous_branche],
              ['Jour', preparation.jour],
              ['Date', preparation.date_lecon],
              [
                'Heure',
                `${valeur(preparation.heure_debut)} - ${valeur(preparation.heure_fin)}`,
              ],
              ['Fiche N°', preparation.fiche_numero],
            ],
            bordures
          ),


          // ==========================================
          // INFORMATIONS PÉDAGOGIQUES
          // ==========================================

          titreWord(
            'INFORMATIONS PÉDAGOGIQUES'
          ),

          champWord(
            'Sujet',
            preparation.sujet
          ),

          champWord(
            'Matériel didactique',
            preparation.materiel_didactique
          ),

          champWord(
            'Référence',
            preparation.reference
          ),

          champWord(
            'Objectif opérationnel',
            preparation.objectif_operationnel
          ),


          // ==========================================
          // DÉROULEMENT
          // ==========================================

          titreWord(
            'DÉROULEMENT DE LA LEÇON'
          ),

          tableauDeroulementWord(
            [
              [
                'Rappel',
                preparation.rappel_enseignant,
                preparation.rappel_apprenants,
              ],
              [
                'Motivation',
                preparation.motivation_enseignant,
                preparation.motivation_apprenants,
              ],
              [
                'Annonce du sujet',
                preparation.annonce_enseignant,
                preparation.annonce_apprenants,
              ],
              [
                'Analyse',
                preparation.analyse_enseignant,
                preparation.analyse_apprenants,
              ],
              [
                'Synthèse',
                preparation.synthese_enseignant,
                preparation.synthese_apprenants,
              ],
            ],
            bordures
          ),


          // ==========================================
          // QUESTIONS
          // ==========================================

          titreWord(
            'QUESTIONS FINALES'
          ),

          champWord(
            'Questions',
            preparation.questions_finales
          ),

          champWord(
            'Réponses',
            preparation.reponses_finales
          ),


          // ==========================================
          // VALIDATION
          // ==========================================

          titreWord(
            'VALIDATION DE LA DIRECTION'
          ),

          new Paragraph({
            children: [
              new TextRun({
                text:
                  'Cette préparation a été validée par la Direction.',
                size: 22,
              }),
            ],
          }),

          new Paragraph({
            spacing: {
              before: 120,
            },

            children: [
              new TextRun({
                text:
                  `Date de validation : ${
                    preparation.date_validation
                      ? new Date(
                          preparation.date_validation
                        ).toLocaleString('fr-FR')
                      : 'Non renseignée'
                  }`,
                size: 21,
              }),
            ],
          }),


          new Paragraph({
            spacing: {
              before: 800,
            },

            children: [
              new TextRun({
                text:
                  'Signature de l’enseignant                    Visa de la Direction',
                bold: true,
                size: 21,
              }),
            ],
          }),

        ],
      },
    ],
  })


  // ================================================
  // CRÉER LE FICHIER
  // ================================================

  const blob = await Packer.toBlob(
    document
  )


  // ================================================
  // TÉLÉCHARGEMENT DIRECT
  // ================================================

  const url = URL.createObjectURL(blob)

  const lien = document.createElement('a')

  lien.href = url

  lien.download =
    nomFichier(preparation, 'docx')

  document.body.appendChild(lien)

  lien.click()

  lien.remove()

  URL.revokeObjectURL(url)
}


// =====================================================
// TITRE PDF
// =====================================================

function ajouterTitrePDF(
  pdf,
  texte,
  x,
  y
) {

  pdf.setFont(
    'helvetica',
    'bold'
  )

  pdf.setFontSize(11)

  pdf.text(
    texte,
    x,
    y
  )

  pdf.setLineWidth(0.3)

  pdf.line(
    x,
    y + 2,
    pdf.internal.pageSize.getWidth() - x,
    y + 2
  )
}


// =====================================================
// CHAMP PDF
// =====================================================

function ajouterChampPDF(
  pdf,
  label,
  contenu,
  x,
  y,
  largeur
) {

  const texte = valeur(contenu)

  pdf.setFont(
    'helvetica',
    'bold'
  )

  pdf.setFontSize(9)

  pdf.text(
    `${label} :`,
    x,
    y
  )

  const largeurTexte =
    largeur - 35

  const lignes =
    pdf.splitTextToSize(
      texte,
      largeurTexte
    )

  pdf.setFont(
    'helvetica',
    'normal'
  )

  pdf.text(
    lignes,
    x + 35,
    y
  )

  return (
    y +
    Math.max(
      7,
      lignes.length * 4.5
    )
  )
}


// =====================================================
// NOUVELLE PAGE SI NÉCESSAIRE
// =====================================================

function nouvellePageSiNecessaire(
  pdf,
  y,
  hauteurNecessaire
) {

  const hauteur =
    pdf.internal.pageSize.getHeight()

  if (
    y + hauteurNecessaire >
    hauteur - 20
  ) {

    pdf.addPage()

    return 18
  }

  return y
}


// =====================================================
// PIED DE PAGE
// =====================================================

function ajouterPiedDePage(
  pdf,
  pageWidth,
  pageHeight
) {

  const nombrePages =
    pdf.internal.getNumberOfPages()

  for (
    let page = 1;
    page <= nombrePages;
    page++
  ) {

    pdf.setPage(page)

    pdf.setFont(
      'helvetica',
      'normal'
    )

    pdf.setFontSize(8)

    pdf.text(
      'Kalebuka Shaloom — Fiche de préparation',
      pageWidth / 2,
      pageHeight - 8,
      {
        align: 'center',
      }
    )

    pdf.text(
      `Page ${page} / ${nombrePages}`,
      pageWidth - 15,
      pageHeight - 8,
      {
        align: 'right',
      }
    )
  }
}


// =====================================================
// TITRE WORD
// =====================================================

function titreWord(texte) {

  return new Paragraph({

    spacing: {
      before: 250,
      after: 120,
    },

    children: [
      new TextRun({
        text: texte,
        bold: true,
        size: 24,
      }),
    ],
  })
}


// =====================================================
// CHAMP WORD
// =====================================================

function champWord(
  label,
  contenu
) {

  return new Table({

    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },

    borders: {
      top: {
        style: BorderStyle.SINGLE,
        size: 1,
      },
      bottom: {
        style: BorderStyle.SINGLE,
        size: 1,
      },
      left: {
        style: BorderStyle.SINGLE,
        size: 1,
      },
      right: {
        style: BorderStyle.SINGLE,
        size: 1,
      },
      insideHorizontal: {
        style: BorderStyle.SINGLE,
        size: 1,
      },
      insideVertical: {
        style: BorderStyle.SINGLE,
        size: 1,
      },
    },

    rows: [
      new TableRow({
        children: [

          new TableCell({
            width: {
              size: 25,
              type: WidthType.PERCENTAGE,
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: label,
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),

          new TableCell({
            width: {
              size: 75,
              type: WidthType.PERCENTAGE,
            },

            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: valeur(contenu),
                    size: 20,
                  }),
                ],
              }),
            ],
          }),

        ],
      }),
    ],
  })
}


// =====================================================
// TABLEAU INFORMATIONS WORD
// =====================================================

function tableauInformationsWord(
  informations,
  bordures
) {

  const lignes = []

  for (
    let i = 0;
    i < informations.length;
    i += 2
  ) {

    const gauche =
      informations[i]

    const droite =
      informations[i + 1]


    lignes.push(

      new TableRow({

        children: [

          celluleWord(
            gauche[0],
            true,
            bordures
          ),

          celluleWord(
            gauche[1],
            false,
            bordures
          ),

          celluleWord(
            droite ? droite[0] : '',
            true,
            bordures
          ),

          celluleWord(
            droite ? droite[1] : '',
            false,
            bordures
          ),

        ],
      })
    )
  }


  return new Table({

    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },

    borders: bordures,

    rows: lignes,
  })
}


// =====================================================
// TABLEAU DÉROULEMENT WORD
// =====================================================

function tableauDeroulementWord(
  lignes,
  bordures
) {

  const rows = [

    new TableRow({

      children: [

        celluleWord(
          'Étape',
          true,
          bordures
        ),

        celluleWord(
          'Enseignant',
          true,
          bordures
        ),

        celluleWord(
          'Apprenants',
          true,
          bordures
        ),

      ],
    }),

  ]


  lignes.forEach((ligne) => {

    rows.push(

      new TableRow({

        children: [

          celluleWord(
            ligne[0],
            true,
            bordures
          ),

          celluleWord(
            valeur(ligne[1]),
            false,
            bordures
          ),

          celluleWord(
            valeur(ligne[2]),
            false,
            bordures
          ),

        ],
      })
    )
  })


  return new Table({

    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },

    borders: bordures,

    rows,
  })
}


// =====================================================
// CELLULE WORD
// =====================================================

function celluleWord(
  texte,
  gras,
  bordures
) {

  return new TableCell({

    borders: bordures,

    verticalAlign:
      VerticalAlign.CENTER,

    children: [

      new Paragraph({

        children: [

          new TextRun({

            text: valeur(texte),

            bold: gras,

            size: 19,

          }),

        ],

      }),

    ],

  })
}