import jsPDF from 'jspdf'
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  HeadingLevel,
} from 'docx'


// =====================================================
// FORMATER UNE DATE
// =====================================================

function formaterDate(date) {

  if (!date) {
    return 'Non renseignée'
  }

  try {

    return new Date(
      `${date}T12:00:00`
    ).toLocaleDateString('fr-FR')

  } catch {

    return date

  }
}


// =====================================================
// TEXTE DU STATUT
// =====================================================

function texteStatut(statut) {

  switch (statut) {

    case 'soumis':
      return 'À vérifier'

    case 'valide':
      return 'Validée'

    case 'rejete':
      return 'Rejetée'

    case 'brouillon':
      return 'Brouillon'

    default:
      return statut || 'Inconnu'
  }

}


// =====================================================
// NOM DU FICHIER
// =====================================================

function nettoyerNom(nom) {

  return String(nom || 'rapport')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]/g, '_')

}


// =====================================================
// EXPORT PDF
// =====================================================

export function exporterRapportPDF(
  preparations,
  filtres = {}
) {

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })


  const marge = 12

  let y = 15


  // ===================================================
  // TITRE
  // ===================================================

  pdf.setFontSize(18)

  pdf.setFont(undefined, 'bold')

  pdf.text(
    'KALEBUKA SHALOOM',
    marge,
    y
  )

  y += 8


  pdf.setFontSize(14)

  pdf.text(
    'Rapport des preparations',
    marge,
    y
  )

  y += 10


  // ===================================================
  // INFORMATIONS FILTRES
  // ===================================================

  pdf.setFontSize(9)

  pdf.setFont(undefined, 'normal')


  const enseignantTexte =
    filtres.enseignantNom ||
    'Tous les enseignants'

  const classeTexte =
    filtres.classeNom ||
    'Toutes les classes'

  const statutTexte =
    filtres.statutNom ||
    'Tous les statuts'


  pdf.text(
    `Enseignant : ${enseignantTexte}`,
    marge,
    y
  )

  y += 5


  pdf.text(
    `Classe : ${classeTexte}`,
    marge,
    y
  )

  y += 5


  pdf.text(
    `Statut : ${statutTexte}`,
    marge,
    y
  )

  y += 5


  pdf.text(
    `Periode : ${
      formaterDate(filtres.dateDebut)
    } → ${
      formaterDate(filtres.dateFin)
    }`,
    marge,
    y
  )

  y += 8


  // ===================================================
  // STATISTIQUES
  // ===================================================

  const total =
    preparations.length

  const soumises =
    preparations.filter(
      (p) => p.statut === 'soumis'
    ).length

  const validees =
    preparations.filter(
      (p) => p.statut === 'valide'
    ).length

  const rejetees =
    preparations.filter(
      (p) => p.statut === 'rejete'
    ).length

  const brouillons =
    preparations.filter(
      (p) => p.statut === 'brouillon'
    ).length


  pdf.setFont(undefined, 'bold')

  pdf.text(
    `Total : ${total}`,
    marge,
    y
  )

  pdf.text(
    `A verifier : ${soumises}`,
    marge + 35,
    y
  )

  pdf.text(
    `Validees : ${validees}`,
    marge + 75,
    y
  )

  pdf.text(
    `Rejetees : ${rejetees}`,
    marge + 115,
    y
  )

  pdf.text(
    `Brouillons : ${brouillons}`,
    marge + 155,
    y
  )

  y += 10


  // ===================================================
  // EN-TÊTE DU TABLEAU
  // ===================================================

  const colonnes = [
    'Enseignant',
    'Classe',
    'Branche',
    'Sujet',
    'Date',
    'Statut',
  ]


  const largeurs = [
    45,
    35,
    35,
    80,
    25,
    30,
  ]


  let x = marge


  pdf.setFontSize(8)

  pdf.setFont(undefined, 'bold')


  colonnes.forEach(
    (colonne, index) => {

      pdf.rect(
        x,
        y - 5,
        largeurs[index],
        8
      )

      pdf.text(
        colonne,
        x + 2,
        y
      )

      x += largeurs[index]

    }
  )


  y += 8


  // ===================================================
  // LIGNES
  // ===================================================

  pdf.setFont(undefined, 'normal')


  preparations.forEach(
    (preparation) => {

      // Nouvelle page si nécessaire
      if (y > 185) {

        pdf.addPage()

        y = 15

      }


      const valeurs = [

        preparation.enseignant_nom ||
          'Non renseigné',

        preparation.classe_nom ||
          'Non affectée',

        preparation.branche ||
          preparation.matiere ||
          'Non renseignée',

        preparation.sujet ||
          preparation.titre ||
          'Sans sujet',

        formaterDate(
          preparation.date_lecon
        ),

        texteStatut(
          preparation.statut
        ),

      ]


      x = marge


      valeurs.forEach(
        (valeur, index) => {

          pdf.rect(
            x,
            y - 5,
            largeurs[index],
            10
          )


          let texte =
            String(valeur)


          // Limiter le texte
          const longueurMax =
            index === 3
              ? 45
              : 22


          if (
            texte.length >
            longueurMax
          ) {

            texte =
              texte.substring(
                0,
                longueurMax - 3
              ) + '...'

          }


          pdf.text(
            texte,
            x + 2,
            y + 1
          )


          x += largeurs[index]

        }
      )


      y += 10

    }
  )


  // ===================================================
  // PIED DE PAGE
  // ===================================================

  const nombrePages =
    pdf.internal.getNumberOfPages()


  for (
    let page = 1;
    page <= nombrePages;
    page++
  ) {

    pdf.setPage(page)

    pdf.setFontSize(8)

    pdf.setFont(undefined, 'normal')

    pdf.text(
      `Kalebuka Shaloom - Rapport administratif - Page ${page}/${nombrePages}`,
      marge,
      202
    )

  }


  // ===================================================
  // TÉLÉCHARGEMENT
  // ===================================================

  pdf.save(
    `Rapport_Preparations_${
      new Date()
        .toISOString()
        .slice(0, 10)
    }.pdf`
  )

}


// =====================================================
// EXPORT WORD
// =====================================================

export async function exporterRapportWord(
  preparations,
  filtres = {}
) {

  const total =
    preparations.length

  const soumises =
    preparations.filter(
      (p) => p.statut === 'soumis'
    ).length

  const validees =
    preparations.filter(
      (p) => p.statut === 'valide'
    ).length

  const rejetees =
    preparations.filter(
      (p) => p.statut === 'rejete'
    ).length

  const brouillons =
    preparations.filter(
      (p) => p.statut === 'brouillon'
    ).length


  // ===================================================
  // TITRE
  // ===================================================

  const enfants = [

    new Paragraph({
      text: 'KALEBUKA SHALOOM',
      heading: HeadingLevel.TITLE,
    }),

    new Paragraph({
      children: [
        new TextRun({
          text: 'Rapport des preparations',
          bold: true,
          size: 28,
        }),
      ],
    }),


    new Paragraph(
      `Enseignant : ${
        filtres.enseignantNom ||
        'Tous les enseignants'
      }`
    ),

    new Paragraph(
      `Classe : ${
        filtres.classeNom ||
        'Toutes les classes'
      }`
    ),

    new Paragraph(
      `Statut : ${
        filtres.statutNom ||
        'Tous les statuts'
      }`
    ),

    new Paragraph(
      `Periode : ${
        formaterDate(filtres.dateDebut)
      } → ${
        formaterDate(filtres.dateFin)
      }`
    ),


    new Paragraph(''),


    // =================================================
    // STATISTIQUES
    // =================================================

    new Paragraph({
      children: [
        new TextRun({
          text: `Total : ${total}    `,
          bold: true,
        }),

        new TextRun({
          text: `A verifier : ${soumises}    `,
        }),

        new TextRun({
          text: `Validees : ${validees}    `,
        }),

        new TextRun({
          text: `Rejetees : ${rejetees}    `,
        }),

        new TextRun({
          text: `Brouillons : ${brouillons}`,
        }),
      ],
    }),


    new Paragraph(''),


    // =================================================
    // TABLEAU
    // =================================================

    new Table({

      rows: [

        new TableRow({

          children: [

            'Enseignant',
            'Classe',
            'Branche',
            'Sujet',
            'Date',
            'Statut',

          ].map(
            (texte) =>
              new TableCell({

                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: texte,
                        bold: true,
                      }),
                    ],
                  }),
                ],

              })
          ),

        }),


        ...preparations.map(
          (preparation) => {

            return new TableRow({

              children: [

                preparation.enseignant_nom ||
                  'Non renseigné',

                preparation.classe_nom ||
                  'Non affectée',

                preparation.branche ||
                  preparation.matiere ||
                  'Non renseignée',

                preparation.sujet ||
                  preparation.titre ||
                  'Sans sujet',

                formaterDate(
                  preparation.date_lecon
                ),

                texteStatut(
                  preparation.statut
                ),

              ].map(
                (texte) =>
                  new TableCell({

                    children: [
                      new Paragraph(
                        String(texte)
                      ),
                    ],

                  })
              ),

            })

          }
        ),

      ],

    }),

  ]


  // ===================================================
  // CRÉER LE DOCUMENT
  // ===================================================

    const doc =
    new Document({
      sections: [
        {
          children: enfants,
        },
      ],
    })

  const blob =
    await Packer.toBlob(doc)

  const url =
    URL.createObjectURL(blob)

  const lien =
    window.document.createElement('a')

  lien.href = url

  lien.download =
    `Rapport_Preparations_${
      new Date()
        .toISOString()
        .slice(0, 10)
    }.docx`

  window.document.body.appendChild(lien)

  lien.click()

  lien.remove()

  URL.revokeObjectURL(url)

}