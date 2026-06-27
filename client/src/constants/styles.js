import { isOutdoorRoomType } from "./roomTypes.js";

export const INTERIOR_CATEGORY_ORDER = [
  "Moderne & épuré",
  "Chaleureux & naturel",
  "Classique & intemporel",
  "Audacieux & décoratif",
  "Luxe & prestige",
  "Inspirations régionales",
];

export const OUTDOOR_CATEGORY_ORDER = [
  "Moderne & design",
  "Méditerranéen & provençal",
  "Resort & bord de mer",
  "Jardin & nature",
  "Urbain & rooftop",
  "Caractère & ambiance",
];

const interior = (id, category, label, description, previewImage) => ({
  id,
  scope: "interior",
  category,
  label,
  description,
  previewImage,
});

const outdoor = (id, category, label, description, previewImage) => ({
  id,
  scope: "outdoor",
  category,
  label,
  description,
  previewImage,
});

export const INTERIOR_STYLES = [
  interior(
    "moderne",
    "Moderne & épuré",
    "Moderne",
    "Lignes épurées, neutres, verre et métal",
    "https://www.futurhomedesign.fr/wp-content/uploads/2017/09/salon-moderne-esthetique.jpg",
  ),
  interior(
    "minimaliste",
    "Moderne & épuré",
    "Minimaliste",
    "Ultra-épuré, monochromatique, espace zen",
    "https://www.madura.com/cdn/shop/articles/pouf_ISILD_008838_N1_1.webp?v=1733829920&width=1000",
  ),
  interior(
    "contemporain",
    "Moderne & épuré",
    "Contemporain",
    "Moderne accessible, chaleureux et actuel",
    "https://www.home-villa.fr/wp-content/uploads/2019/06/HEN_Prato_Zembla.jpg",
  ),
  interior(
    "bauhaus",
    "Moderne & épuré",
    "Bauhaus",
    "Modernisme fonctionnel, géométrie et couleurs primaires",
    "https://st.hzcdn.com/simgs/6791119504a331ea_14-1907/_.jpg",
  ),
  interior(
    "loft",
    "Moderne & épuré",
    "Loft urbain",
    "Volumes ouverts, béton, art contemporain",
    "https://www.notreloft.com/images/2019/07/loft-industriel-sydney-00100.jpg",
  ),
  interior(
    "scandinave",
    "Chaleureux & naturel",
    "Scandinave",
    "Bois clair, tons blancs/gris, ambiance cozy",
    "https://www.for-interieur.fr/wp-content/uploads/2023/02/interieur-scandinave-7.jpg",
  ),
  interior(
    "japandi",
    "Chaleureux & naturel",
    "Japandi",
    "Minimalisme japonais rencontre le hygge scandinave",
    "https://www.optiondinterieur.com/wp-content/uploads/2021/01/canape-chaise-matiere-palette-de-couleur-style-japandi.jpg",
  ),
  interior(
    "zen",
    "Chaleureux & naturel",
    "Zen",
    "Calme, bambou, pierre, ambiance spa",
    "https://www.systemed.fr/images/conseils/deco-zen-et-naturelle-pour-son-interieur-16623.jpg",
  ),
  interior(
    "wabi_sabi",
    "Chaleureux & naturel",
    "Wabi-Sabi",
    "Imperfection belle, lin brut, céramique artisanale",
    "https://www.zago-store.com/cdn/shop/articles/AdobeStock_613775132-2-min.jpg?v=1739762021&width=1100",
  ),
  interior(
    "campagne",
    "Chaleureux & naturel",
    "Campagne",
    "Farmhouse moderne, bois chaud et charme rural",
    "https://maison.20minutes.fr/wp-content/uploads/2021/10/1-la-deco-campagne-chic-a-le-vent-en-poupe-maisons-du-monde.jpg",
  ),
  interior(
    "rustique",
    "Chaleureux & naturel",
    "Rustique",
    "Bois massif, pierre, ambiance chalet raffiné",
    "https://housse-deco.com/cdn/shop/articles/salon_au_style_rustique_de_montagne_c03f226c-9198-4c0e-8149-1d4bc74897f2_1600x.jpg?v=1590724148",
  ),
  interior(
    "cottagecore",
    "Chaleureux & naturel",
    "Cottagecore",
    "Romantique campagnard, fleurs et pastels",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSks6xOuXYXgA4s1yixiA3my0DbmuuLSVvEFQ&s",
  ),
  interior(
    "classique",
    "Classique & intemporel",
    "Classique",
    "Élégance traditionnelle, bois sombre, symétrie",
    "https://www.lamaisonsaintgobain.fr/sites/lmsg/files/2020-08/style-classique-chic-appart-hausmanien-1-1200x675.jpg",
  ),
  interior(
    "transitionnel",
    "Classique & intemporel",
    "Transitionnel",
    "Entre classique et moderne, neutres intemporels",
    "https://annartfactory.fr/wp-content/uploads/2023/05/style-transtionnel-deco-2.jpeg",
  ),
  interior(
    "colonial",
    "Classique & intemporel",
    "Colonial",
    "Élégance héritage, acajou, symétrie formelle",
    "https://www.megasb.fr/media/36/f8/f8/1712313638/Kolonial_Mobil.webp?ts=1776757296",
  ),
  interior(
    "vintage",
    "Classique & intemporel",
    "Vintage",
    "Charme rétro, patine et nostalgie douce",
    "https://www.for-interieur.fr/wp-content/uploads/2018/07/fauteuil-vintage.jpg",
  ),
  interior(
    "art_nouveau",
    "Classique & intemporel",
    "Art Nouveau",
    "Courbes organiques, motifs botaniques, Belle Époque",
    "https://www.louiseantiquites.com/wp-content/uploads/2022/03/tout-savoir-art-nouveau.jpg.webp",
  ),
  interior(
    "mid_century",
    "Audacieux & décoratif",
    "Mid-Century",
    "Teck, formes organiques, rétro chic",
    "https://www.mesrideaux.fr/blog/wp-content/uploads/2024/06/decorilla.jpg",
  ),
  interior(
    "industriel",
    "Audacieux & décoratif",
    "Industriel",
    "Brique, acier, cuir et bois brut",
    "https://oknoplast.fr/content/uploads/2019/07/interieur_style_industriel.jpg",
  ),
  interior(
    "boheme",
    "Audacieux & décoratif",
    "Bohème",
    "Couleurs riches, textures naturelles, éclectique",
    "https://oknoplast.fr/content/uploads/2022/08/style_boho_tendances_interieur-1.jpg",
  ),
  interior(
    "eclectique",
    "Audacieux & décoratif",
    "Éclectique",
    "Mélange assumé d'époques et de influences",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUhxWuhZWIa2Yz6uyEcClaAY84nctYrXfyfw&s",
  ),
  interior(
    "maximaliste",
    "Audacieux & décoratif",
    "Maximaliste",
    "Couleurs saturées, motifs, impact visuel fort",
    "https://resize.elle.fr/original/var/plain_site/storage/images/deco/news-tendances/tendance-deco-le-maximalisme-envahit-instagram-3986753/96034617-1-fre-FR/Tendance-deco-le-maximalisme-envahit-Instagram.jpg",
  ),
  interior(
    "art_deco",
    "Audacieux & décoratif",
    "Art Déco",
    "Géométrie, velours, or et glamour années 20",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiLjL9ZTrgJfRN-tV4QscnRwWrhY9JfR1JCQ&s",
  ),
  interior(
    "hollywood",
    "Audacieux & décoratif",
    "Hollywood Regency",
    "Glamour, velours, miroirs et contrastes audacieux",
    "https://www.hulmara.com/cdn/shop/articles/hollywood-regency-style-glamour-contemporary-home-decor-hulmara.webp?v=1763638262&width=2048",
  ),
  interior(
    "luxe",
    "Luxe & prestige",
    "Luxe",
    "Marbre, velours, finitions haut de gamme",
    "https://www.kunstloft.fr/magazine/wp-content/uploads/2024/05/Luxury-Home-Furnitures-bild-1024x800.png",
  ),
  interior(
    "coastal",
    "Inspirations régionales",
    "Côtier",
    "Blanc, bleu doux, ambiance bord de mer",
    "https://media.architecturaldigest.com/photos/6410bb0291526c92b3c540ef/16:9/w_6639,h_3734,c_limit/3%20(1).jpg",
  ),
  interior(
    "tropical",
    "Inspirations régionales",
    "Tropical",
    "Rotin, bambou, vert luxuriant, resort",
    "https://www.lamaison.fr/media/wysiwyg/03_Lamaisonfr_Visuel_Article_Tropical.jpg",
  ),
  interior(
    "mediterraneen",
    "Inspirations régionales",
    "Méditerranéen",
    "Terracotta, blanc, bleu azur, villa ensoleillée",
    "https://www.decolecedre.com/wp-content/uploads/2025/05/deco-mediterraneenne-.jpg",
  ),
  interior(
    "provencal",
    "Inspirations régionales",
    "Provençal",
    "Charme français, lavande, bois patiné",
    "https://resize.elle.fr/article/var/plain_site/storage/images/deco/art-decoration/habiteriez-vous-dans-cette-superbe-bastide-provencale/70193902-1-fre-FR/Habiteriez-vous-dans-cette-superbe-bastide-provencale.jpg",
  ),
  interior(
    "desert_modern",
    "Inspirations régionales",
    "Désert moderne",
    "Adobe, terracotta, lignes du Sud-Ouest américain",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9dQofChbhQb4jgwgYu0l97sxCwd9CZVt8Fw&s",
  ),
];

export const OUTDOOR_STYLES = [
  outdoor(
    "terrasse_moderne",
    "Moderne & design",
    "Terrasse moderne",
    "Aluminium, lignes épurées, mobilier design",
    "https://www.renoval-veranda.com/app/uploads/2024/07/page-PERGOLA_TOITURE_FIXE_TOITURE_VITREE_SUCE_SUR_ERDRE-11-1024x600.jpg",
  ),
  outdoor(
    "patio_minimaliste",
    "Moderne & design",
    "Patio minimaliste",
    "Monochrome, volumes simples, terrasse épurée",
    "https://images.homify.com/v1453298632/p/photo/image/1258055/vista2__.jpg",
  ),
  outdoor(
    "patio_contemporain",
    "Moderne & design",
    "Patio contemporain",
    "Courbes douces, bois clair, confort actuel",
    "https://resize.elle.fr/article/var/plain_site/storage/images/deco/exterieur/jardin/comment-avoir-un-exterieur-contemporain-selon-un-expert-4247230/102450388-1-fre-FR/Comment-avoir-un-exterieur-contemporain-selon-un-expert.jpg",
  ),
  outdoor(
    "villa_mediterraneen",
    "Méditerranéen & provençal",
    "Villa méditerranéenne",
    "Terracotta, fer forgé, oliviers en pot",
    "https://realty-luxe.com/wp-content/uploads/2019/04/villa-miami-8-870x420.jpg",
  ),
  outdoor(
    "provencal_jardin",
    "Méditerranéen & provençal",
    "Jardin provençal",
    "Lavande, pierre, mobilier patiné du Sud",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWTB3vxzKEKMfv-i2dQ3_muUwTFlYj-wyw3A&s",
  ),
  outdoor(
    "resort_tropical",
    "Resort & bord de mer",
    "Resort tropical",
    "Bambou, transats, végétation luxuriante",
    "https://gstatic1.promeai.pro/article/2025/09/09/9d4b6c6b91bc402b960759c3fe345db2.jpg",
  ),
  outdoor(
    "bord_de_mer",
    "Resort & bord de mer",
    "Bord de mer",
    "Teck blanchi, corde, ambiance côtière",
    "https://i.pinimg.com/736x/3d/66/c9/3d66c90d27db75a31657a4a24d664853.jpg",
  ),
  outdoor(
    "luxe_piscine",
    "Resort & bord de mer",
    "Luxe piscine",
    "Résine tressée, transats premium, pool party",
    "https://www.europiscine.com/wp-content/uploads/2023/09/jardin-integration-piscine-piscine-et-jardin-%C2%A9patrick-honnorat.jpg?wsr",
  ),
  outdoor(
    "jardin_scandinave",
    "Jardin & nature",
    "Jardin scandinave",
    "Bois clair, textiles gris, terrasse hygge",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4_O6k9Dy8El9YZSHXzknLTRc2-pNz8xarPA&s",
  ),
  outdoor(
    "jardin_zen",
    "Jardin & nature",
    "Jardin zen",
    "Pierre, bambou, bassin, calme méditatif",
    "https://resize.elle.fr/article/var/plain_site/storage/images/deco/exterieur/jardin/jardin-zen-visez-la-plenitude/69280240-7-fre-FR/Jardin-zen-visez-la-plenitude.jpg",
  ),
  outdoor(
    "campagne_verger",
    "Jardin & nature",
    "Campagne & verger",
    "Chêne, fer forgé, charme rural authentique",
    "https://i-dj.unimedias.fr/2023/09/12/dj-creez-un-jardin-de-campagne-maison-suppl119-65001cd5a7aed.jpg?auto=format%2Ccompress&crop=faces&cs=tinysrgb&fit=crop&h=501&ixlib=php-4.1.0&w=890",
  ),
  outdoor(
    "cottage_anglais",
    "Jardin & nature",
    "Cottage anglais",
    "Fleurs, fer forgé, romantisme campagnard",
    "https://upload.wikimedia.org/wikipedia/commons/a/ae/Anne_Hathaways_Cottage_and_gardens_15g2006.jpg",
  ),
  outdoor(
    "rooftop_urbain",
    "Urbain & rooftop",
    "Rooftop urbain",
    "Terrasse ville, mobilier modulaire, vue skyline",
    "https://resize.elle.fr/original/var/plain_site/storage/images/deco/exterieur/terrasse/avant-apres-un-toit-terrasse-delaisse-metamorphose-en-oasis-de-fraicheur-urbaine/102273576-1-fre-FR/Avant-Apres-un-toit-terrasse-delaisse-metamorphose-en-oasis-de-fraicheur-urbaine.jpg",
  ),
];

/** Tous les styles (recherche labels historique). */
export const STYLES = [...INTERIOR_STYLES, ...OUTDOOR_STYLES];

export const DEFAULT_INTERIOR_STYLE = "moderne";
export const DEFAULT_OUTDOOR_STYLE = "terrasse_moderne";

export function getStylesForRoomType(roomType) {
  return isOutdoorRoomType(roomType) ? OUTDOOR_STYLES : INTERIOR_STYLES;
}

export function getStyleCategoryOrder(roomType) {
  return isOutdoorRoomType(roomType)
    ? OUTDOOR_CATEGORY_ORDER
    : INTERIOR_CATEGORY_ORDER;
}

export function getDefaultStyleForRoomType(roomType) {
  return isOutdoorRoomType(roomType)
    ? DEFAULT_OUTDOOR_STYLE
    : DEFAULT_INTERIOR_STYLE;
}

export function getStyleById(styleId) {
  return STYLES.find((s) => s.id === styleId) ?? null;
}

export function isStyleValidForRoom(styleId, roomType) {
  const scope = isOutdoorRoomType(roomType) ? "outdoor" : "interior";
  const style = getStyleById(styleId);
  return style?.scope === scope;
}

export function resolveStyleForRoom(styleId, roomType) {
  if (isStyleValidForRoom(styleId, roomType)) return styleId;
  return getDefaultStyleForRoomType(roomType);
}
