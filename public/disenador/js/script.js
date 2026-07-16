const THEME_STORAGE_KEY = "starbade-theme-mode";
const PERFORMANCE_WARNING_STORAGE_KEY = "starbade-performance-warning-dismissed";
const CONFIGURATOR_AUTOSAVE_STORAGE_KEY = "starbade-configurator-autosave-v2";
const CONFIGURATOR_AUTOSAVE_LEGACY_STORAGE_KEYS = ["starbade-configurator-autosave-v1"];
const CONFIGURATOR_AUTOSAVE_VERSION = 2;
const CONFIGURATOR_AUTOSAVE_DELAY = 260;
const CONFIGURATOR_AUTOSAVE_MOLD_DELAY = 1600;
const DESIGN_IMAGE_WORKER_UPLOAD_ENDPOINT = "https://starbade-design-images.bocetostarbade.workers.dev/api/design-image";
const DESIGN_IMAGE_SITE_UPLOAD_ENDPOINT = "/api/design-image";
const menuBtn = document.getElementById("menuBtn");
const themeModeToggle = document.getElementById("themeModeToggle");
const mobileThemeModeToggle = document.getElementById("mobileThemeModeToggle");
const mainLayout = document.querySelector(".main-layout");
const quoteCollapseToggle = document.getElementById("quoteCollapseToggle");
const addShieldBtn = document.getElementById("addShieldBtn");
const mobileAddShieldBtn = document.getElementById("mobileAddShieldBtn");
const addSponsorBtn = document.getElementById("addSponsorBtn");
const mobileAddSponsorBtn = document.getElementById("mobileAddSponsorBtn");
const backSponsorBtn = document.getElementById("backSponsorBtn");
const mobileBackSponsorBtn = document.getElementById("mobileBackSponsorBtn");

const panelHombrosBtn = document.getElementById("panelHombrosBtn");
const mobilePanelHombrosBtn = document.getElementById("mobilePanelHombrosBtn");
const panelHombrosToggle = document.getElementById("panelHombrosToggle");
const mobilePanelHombrosToggle = document.getElementById("mobilePanelHombrosToggle");

const borderPanelHombrosBtn = document.getElementById("borderPanelHombrosBtn");
const mobileBorderPanelHombrosBtn = document.getElementById("mobileBorderPanelHombrosBtn");
const borderPanelHombrosToggle = document.getElementById("borderPanelHombrosToggle");
const mobileBorderPanelHombrosToggle = document.getElementById("mobileBorderPanelHombrosToggle");
const panelHombrosLabels = [
  panelHombrosBtn?.querySelector("span"),
  mobilePanelHombrosBtn?.querySelector("span")
];
const borderPanelHombrosLabels = [
  borderPanelHombrosBtn?.querySelector("span"),
  mobileBorderPanelHombrosBtn?.querySelector("span")
];

const panelLateralesBtn = document.getElementById("panelLateralesBtn");
const mobilePanelLateralesBtn = document.getElementById("mobilePanelLateralesBtn");
const panelLateralesToggle = document.getElementById("panelLateralesToggle");
const mobilePanelLateralesToggle = document.getElementById("mobilePanelLateralesToggle");

const borderPanelLateralesBtn = document.getElementById("borderPanelLateralesBtn");
const mobileBorderPanelLateralesBtn = document.getElementById("mobileBorderPanelLateralesBtn");
const borderPanelLateralesToggle = document.getElementById("borderPanelLateralesToggle");
const mobileBorderPanelLateralesToggle = document.getElementById("mobileBorderPanelLateralesToggle");

const lineCuelloBtn = document.getElementById("lineCuelloBtn");
const mobileLineCuelloBtn = document.getElementById("mobileLineCuelloBtn");
const lineCuelloToggle = document.getElementById("lineCuelloToggle");
const mobileLineCuelloToggle = document.getElementById("mobileLineCuelloToggle");

const lineFinaBtn = document.getElementById("lineFinaBtn");
const mobileLineFinaBtn = document.getElementById("mobileLineFinaBtn");
const lineFinaToggle = document.getElementById("lineFinaToggle");
const mobileLineFinaToggle = document.getElementById("mobileLineFinaToggle");

const lineGruesaBtn = document.getElementById("lineGruesaBtn");
const mobileLineGruesaBtn = document.getElementById("mobileLineGruesaBtn");
const lineGruesaToggle = document.getElementById("lineGruesaToggle");
const mobileLineGruesaToggle = document.getElementById("mobileLineGruesaToggle");

const lineInferiorBtn = document.getElementById("lineInferiorBtn");
const mobileLineInferiorBtn = document.getElementById("mobileLineInferiorBtn");
const lineInferiorToggle = document.getElementById("lineInferiorToggle");
const mobileLineInferiorToggle = document.getElementById("mobileLineInferiorToggle");

const linePunosBtn = document.getElementById("linePunosBtn");
const mobileLinePunosBtn = document.getElementById("mobileLinePunosBtn");
const linePunosLeftBtn = document.getElementById("linePunosLeftBtn");
const mobileLinePunosLeftBtn = document.getElementById("mobileLinePunosLeftBtn");
const linePunosRightBtn = document.getElementById("linePunosRightBtn");
const mobileLinePunosRightBtn = document.getElementById("mobileLinePunosRightBtn");
const linePunosToggle = document.getElementById("linePunosToggle");
const mobileLinePunosToggle = document.getElementById("mobileLinePunosToggle");
const linePunosSplitToggle = document.getElementById("linePunosSplitToggle");
const mobileLinePunosSplitToggle = document.getElementById("mobileLinePunosSplitToggle");

const designOverlay = document.getElementById("designOverlay");
const designPanel = document.getElementById("designPanel");
const closeDesignPanel = document.getElementById("closeDesignPanel");
const sponsorOverlay = document.getElementById("sponsorOverlay");
const sponsorPanel = document.getElementById("sponsorPanel");
const closeSponsorPanel = document.getElementById("closeSponsorPanel");
const backSponsorOverlay = document.getElementById("backSponsorOverlay");
const backSponsorPanel = document.getElementById("backSponsorPanel");
const closeBackSponsorPanel = document.getElementById("closeBackSponsorPanel");
const designsOverlay = document.getElementById("designsOverlay");
const designsPanel = document.getElementById("designsPanel");
const closeDesignsPanel = document.getElementById("closeDesignsPanel");
const addDesignBtn = document.getElementById("addDesignBtn");
const designColorControls = document.getElementById("designColorControls");
const catalogDesignsBtn = document.getElementById("catalogDesignsBtn");
const catalogDesignsPanel = document.getElementById("catalogDesignsPanel");
const closeCatalogDesignsPanel = document.getElementById("closeCatalogDesignsPanel");
const catalogDesignsBack = document.getElementById("catalogDesignsBack");
const traditionalDesignsBtn = document.getElementById("traditionalDesignsBtn");
const traditionalDesignsPanel = document.getElementById("traditionalDesignsPanel");
const closeTraditionalDesignsPanel = document.getElementById("closeTraditionalDesignsPanel");
const traditionalDesignsBack = document.getElementById("traditionalDesignsBack");
const traditionalDesignItems = document.querySelectorAll(".traditional-designs-item");
const mobileAddDesignBtn = document.getElementById("mobileAddDesignBtn");
const mobileDesignColorControls = document.getElementById("mobileDesignColorControls");
const mobileMenu = document.getElementById("mobileMenu");
const kitViewButtons = document.querySelectorAll(".kit-view-btn");
const viewer3dRoot = document.getElementById("viewer3dRoot");
const viewer3dStatus = document.getElementById("viewer3dStatus");
const viewerWarningBtn = document.getElementById("viewerWarningBtn");
const viewerWarningOverlay = document.getElementById("viewerWarningOverlay");
const viewerWarningPanel = document.getElementById("viewerWarningPanel");
const closeViewerWarningPanel = document.getElementById("closeViewerWarningPanel");
const viewerWarningActivateSidePanels = document.getElementById("viewerWarningActivateSidePanels");
const performanceWarningOverlay = document.getElementById("performanceWarningOverlay");
const performanceWarningPanel = document.getElementById("performanceWarningPanel");
const closePerformanceWarningPanel = document.getElementById("closePerformanceWarningPanel");
const performanceWarningTitle = document.getElementById("performanceWarningTitle");
const performanceWarningText = document.getElementById("performanceWarningText");
const performanceWarningDontShow = document.getElementById("performanceWarningDontShow");
const performanceWarningAcceptBtn = document.getElementById("performanceWarningAcceptBtn");
const autosaveRecoveryOverlay = document.getElementById("autosaveRecoveryOverlay");
const autosaveRecoveryPanel = document.getElementById("autosaveRecoveryPanel");
const closeAutosaveRecoveryPanel = document.getElementById("closeAutosaveRecoveryPanel");
const recoverAutosaveDesignBtn = document.getElementById("recoverAutosaveDesignBtn");
const discardAutosaveDesignBtn = document.getElementById("discardAutosaveDesignBtn");
const saveDesignOverlay = document.getElementById("saveDesignOverlay");
const saveDesignPanel = document.getElementById("saveDesignPanel");
const closeSaveDesignPanel = document.getElementById("closeSaveDesignPanel");
const saveDesignDownloadBtn = document.getElementById("saveDesignDownloadBtn");
const copyDesignLinkBtn = document.getElementById("copyDesignLinkBtn");
const quoteRequestOverlay = document.getElementById("quoteRequestOverlay");
const quoteRequestPanel = document.getElementById("quoteRequestPanel");
const closeQuoteRequestPanel = document.getElementById("closeQuoteRequestPanel");
const changeMoldBtn = document.getElementById("changeMoldBtn");
const moldOverlay = document.getElementById("moldOverlay");
const moldPanel = document.getElementById("moldPanel");
const closeMoldPanel = document.getElementById("closeMoldPanel");
const moldOptionItems = document.querySelectorAll(".mold-option-item");
const lapelInfoBtn = document.getElementById("lapelInfoBtn");
const mobileLapelInfoBtn = document.getElementById("mobileLapelInfoBtn");
const quoteNameInput = document.getElementById("quoteNameInput");
const mobileQuoteNameInput = document.getElementById("mobileQuoteNameInput");
const quoteTeamInput = document.getElementById("quoteTeamInput");
const mobileQuoteTeamInput = document.getElementById("mobileQuoteTeamInput");
const quoteNameLimitHint = document.getElementById("quoteNameLimitHint");
const mobileQuoteNameLimitHint = document.getElementById("mobileQuoteNameLimitHint");
const quoteTeamLimitHint = document.getElementById("quoteTeamLimitHint");
const mobileQuoteTeamLimitHint = document.getElementById("mobileQuoteTeamLimitHint");
const quoteSizeButtons = document.querySelectorAll("[data-quote-size]");
const quoteRequestBtn = document.getElementById("quoteRequestBtn");
const mobileQuoteRequestBtn = document.getElementById("mobileQuoteRequestBtn");
const quoteWhatsappBtn = document.getElementById("quoteWhatsappBtn");
const quoteEmailBtn = document.getElementById("quoteEmailBtn");
const quoteUploadError = document.getElementById("quoteUploadError");
const quoteImageBtn = document.querySelector(".quote-image-btn");
const mobileViewDownloadBtn = document.querySelector(".mobile-view-download-btn");
const quoteSizeState = new Set();
const designImageUploadEndpoint = window.STARBADE_DESIGN_UPLOAD_ENDPOINT || getDefaultDesignImageUploadEndpoint();
let quoteContactRequestInProgress = false;
const unsavedChangesMessage = "Si salís ahora, podés perder los cambios de tu diseño. Para conservarlo, copiá el link antes de salir.";
let unsavedChangesBaseline = "";
let isBeforeUnloadTemporarilyAllowed = false;
let configuratorAutosaveTimer = null;
let configuratorAutosaveInitialFingerprint = "";
let configuratorAutosaveSuppressed = false;

const kitCameraState = {
  view: "shirt",
  cameraTargets: {
    shirt: "kitCameraShirt",
    shirtShort: "kitCameraShirtShort",
    full: "kitCameraFull"
  },
  presets: {}
};

const kitMoldPaths = {
  "classic-crew": "./models/Manga Pegada - Cuello Redondo - Final.glb",
  "classic-v": "./models/Manga Pegada - Cuello V - Final.glb",
  "classic-polo": "./models/Manga Pegada - Cuello Polo - Final.glb",
  "ranglan-crew": "./models/Manga Ranglan - Cuello Redondo - Final.glb",
  "ranglan-v": "./models/Manga Ranglan - Cuello V - Final.glb",
  "ranglan-polo": "./models/Manga Ranglan - Cuello Polo - Final.glb"
};
const NORMAL_MAP_INTENSITY = 3;
const FIXED_DARK_MATERIAL_NAMES = new Set([
  "Material3832680",
  "Material3832681",
  "Material492716",
  "Material492717"
]);

let selectedMold = "classic-crew";

const initialRed = "#d91c1c";
const initialDesignRed = "#5b0000";
const initialDesignOrange = "#7a3200";
const initialWhite = "#ffffff";
const initialBlack = "#404040";
const initialBlackMid = "#5c5c5c";
const initialWhiteMid = "#e3e3e3";
const autoResolveStarbadeLogoColorConflicts = true;

const kitMaterialState = {
  frontColor: initialRed,
  backColor: initialRed,
  neckColor: initialWhite,
  lapelColor: initialWhite,
  shortColor: initialWhite,
  socksColor: initialRed
};

const kitDesignState = {
  selectedDesign: "sin-diseno",
  color: initialDesignRed,
  secondaryColor: initialDesignOrange
};

const twoColorDesigns = new Set([
  "franja-escudo",
  "franja-escudo-2",
  "franja-central",
  "chevron-dos-colores",
  "banda-diagonal-dos-colores",
  "banda-diagonal-2-dos-colores",
  "franja-horizontal-dos-colores",
  "bandera",
  "franja-vertical-dos-colores",
  "rayas-con-puntos",
  "rayas-con-grunge",
  "rayas-diagonales-dos-colores",
  "mosaico",
  "halftone-diagonal",
  "2-bastones-con-lineas",
  "3-bastones-con-lineas",
  "4-bastones-con-lineas",
  "marmol-dos-colores",
  "formas",
  "camuflaje",
  "abstracto",
  "puas",
  "glitch",
  "espinas"
]);

const sideContinuityWarningDesigns = new Set([
  "franja-horizontal",
  "franja-horizontal-dos-colores",
  "hoops",
  "hoops2",
  "degrade-linea",
  "formas"
]);

const sleeveOnlyDesigns = new Set([
  "mangas-triangulos",
  "mangas-ondas",
  "mangas-fuego",
  "mangas-hexagonos",
  "mangas-animal-print",
  "mangas-circulos",
  "mangas-cuadros",
  "mangas-curvas",
  "mangas-floral",
  "mangas-picos",
  "mangas-abstracto",
  "mangas-art-deco"
]);

const sleeveDesignColorConflictDesigns = new Set([
  "2-bastones",
  "3-bastones",
  "4-bastones",
  "hoops",
  "hoops2",
  "pinstripes",
  "zigzag",
  "2-bastones-catalogo",
  ...sleeveOnlyDesigns
]);

const backDesignColorFreeDesigns = new Set([
  "franja-halftone",
  "geometrico",
  "chevron",
  "cuadros-4"
]);

const twoColorDesignMaterialTargets = {
  "rayas-con-puntos": ["front", "back", "sleeves"],
  "rayas-con-grunge": ["front", "back", "sleeves"],
  "2-bastones-con-lineas": ["front", "back", "sleeves"],
  "3-bastones-con-lineas": ["front", "back", "sleeves"],
  "4-bastones-con-lineas": ["front", "back", "sleeves"],
  "rayas-diagonales-dos-colores": ["front", "back"],
  mosaico: ["front", "back"],
  "halftone-diagonal": ["front", "back"],
  "marmol-dos-colores": ["front", "back"],
  formas: ["front", "back"],
  camuflaje: ["front", "back"],
  abstracto: ["front", "back"],
  puas: ["front", "back"],
  glitch: ["front", "back"],
  espinas: ["front", "back"],
  "banda-diagonal-dos-colores": ["front", "back"],
  "banda-diagonal-2-dos-colores": ["front", "back"],
  "franja-horizontal-dos-colores": ["front", "back"],
  bandera: ["front", "back"],
  "franja-vertical-dos-colores": ["front", "back"],
  "franja-escudo": ["front"],
  "franja-escudo-2": ["front"],
  "franja-central": ["front"],
  "chevron-dos-colores": ["front"]
};

const frontLogoBlockedWhenPrimaryDesignMatchesFront = new Set([
  "bandera",
  "halftone-diagonal",
  "camuflaje"
]);

const frontLogoAlwaysBlockedFromPrimaryDesignColor = new Set([
  "2-bastones-con-lineas",
  "franja-vertical-dos-colores"
]);

const backLogoBlockedWhenPrimaryDesignMatchesBack = new Set([
  "halftone-diagonal"
]);

const frontLogoBlockedWhenDesignColorsMatch = new Set([
  "banda-diagonal-2-dos-colores",
  "franja-escudo-2",
  "chevron-dos-colores"
]);

const backLogoBlockedWhenDesignColorsMatch = new Set([
  "franja-vertical-dos-colores"
]);

const kitPanelLayerState = {
  shoulderColor: initialWhite,
  shoulderBorderColor: initialBlack,
  sideColor: initialWhite,
  sideBorderColor: initialBlack,
  neckLineColor: initialBlackMid,
  cuffLineColor: initialBlackMid,
  cuffLineLeftColor: initialWhite,
  cuffLineRightColor: initialBlack,
  shortFineLineColor: initialRed,
  shortThickLineColor: initialRed,
  shortBottomLineColor: initialRed
};

const kitDesignTexturePaths = {
  classic: {
    "2-bastones": "./textures/disenos_manga_clasica/dsgn_2_bastones_clsc.png",
    "3-bastones": "./textures/disenos_manga_clasica/dsgn_3_bastones_clsc.png",
    "4-bastones": "./textures/disenos_manga_clasica/dsgn_4_bastones_clsc.png",
    "banda-diagonal": "./textures/disenos_manga_clasica/dsgn_banda_diagonal_clsc.png",
    "banda-diagonal-2": "./textures/disenos_manga_clasica/dsgn_banda_diagonal2_clsc.png",
    "franja-horizontal": "./textures/disenos_manga_clasica/dsgn_franja_hzt_clsc.png",
    chevron: "./textures/disenos_manga_clasica/dsgn_chevron_clsc.png",
    mitad: "./textures/disenos_manga_clasica/dsgn_mitad_clsc.png",
    hoops: "./textures/disenos_manga_clasica/dsgn_hoops_clsc.png",
    hoops2: "./textures/disenos_manga_clasica/dsgn_hoops2_clsc.png",
    "franja-vertical": "./textures/disenos_manga_clasica/dsgn_franja_vtc_clsc.png",
    "cuadros-4": "./textures/disenos_manga_clasica/dsgn_4_cuadros_clsc.png",
    "mitad-diagonal": "./textures/disenos_manga_clasica/dsgn_mitad_diagonal_clsc.png",
    "mitad-diagonal-2": "./textures/disenos_manga_clasica/dsgn_mitad_diagonal2_clsc.png",
    pinstripes: "./textures/disenos_manga_clasica/dsgn_pinstripes_clsc.png",
    cuadros: "./textures/disenos_manga_clasica/dsgn_cuadros_clsc.png",
    "bloque-superior": "./textures/disenos_manga_clasica/dsgn_bloque_superior_clsc.png",
    "franja-escudo": "./textures/disenos_manga_clasica/dsgn2_franja_escudo_1_clsc.png",
    "franja-escudo-2": "./textures/disenos_manga_clasica/dsgn2_franja_escudo2_1_clsc.png",
    "franja-central": "./textures/disenos_manga_clasica/dsgn2_franja_central_1_clsc.png",
    "chevron-dos-colores": "./textures/disenos_manga_clasica/dsgn2_chevron_1_clsc.png",
    "banda-diagonal-dos-colores": "./textures/disenos_manga_clasica/dsgn2_banda_diagonal_1_clsc.png",
    "banda-diagonal-2-dos-colores": "./textures/disenos_manga_clasica/dsgn2_banda_diagonal2_1_clsc.png",
    "franja-horizontal-dos-colores": "./textures/disenos_manga_clasica/dsgn2_franja_hzt_1_clsc.png",
    bandera: "./textures/disenos_manga_clasica/dsgn2_bandera_1_clsc.png",
    "franja-vertical-dos-colores": "./textures/disenos_manga_clasica/dsgn2_franja_vtc_1_clsc.png",
    "degrade-linea": "./textures/disenos_manga_clasica/sbdsgn_degrade_clsc.png",
    ondas: "./textures/disenos_manga_clasica/sbdsgn_ondas_clsc.png",
    zigzag: "./textures/disenos_manga_clasica/sbdsgn_zigzag_clsc.png",
    "zigzag-2": "./textures/disenos_manga_clasica/sbdsgn_zigzag2_clsc.png",
    "rayas-diagonales": "./textures/disenos_manga_clasica/sbdsgn_rayas_diagonales_clsc.png",
    "lineas-finas": "./textures/disenos_manga_clasica/sbdsgn_lineas_finas_clsc.png",
    tribal: "./textures/disenos_manga_clasica/sbdsgn_tribal_clsc.png",
    rocoso: "./textures/disenos_manga_clasica/sbdsgn_rocoso_clsc.png",
    marmol: "./textures/disenos_manga_clasica/sbdsgn_marmol_clsc.png",
    halftone: "./textures/disenos_manga_clasica/sbdsgn_halftone_clsc.png",
    flechas: "./textures/disenos_manga_clasica/sbdsgn_flechas_clsc.png",
    estrellado: "./textures/disenos_manga_clasica/sbdsgn_estrellado_clsc.png",
    lineas: "./textures/disenos_manga_clasica/sbdsgn_lineas_clsc.png",
    "lineas-circulares": "./textures/disenos_manga_clasica/sbdsgn_lineas_circulares_clsc.png",
    "2-bastones-catalogo": "./textures/disenos_manga_clasica/sbdsgn_2bastones_clsc.png",
    rombos: "./textures/disenos_manga_clasica/sbdsgn_rombos_clsc.png",
    grietas: "./textures/disenos_manga_clasica/sbdsgn_grietas_clsc.png",
    grunge: "./textures/disenos_manga_clasica/sbdsgn_grunge_clsc.png",
    garra: "./textures/disenos_manga_clasica/sbdsgn_garra_clsc.png",
    "franja-halftone": "./textures/disenos_manga_clasica/sbdsgn_franja_halftone_clsc.png",
    olas: "./textures/disenos_manga_clasica/sbdsgn_olas_clsc.png",
    geometrico: "./textures/disenos_manga_clasica/sbdsgn_geometrico_clsc.png",
    rafaga: "./textures/disenos_manga_clasica/sbdsgn_rafaga_clsc.png",
    "mangas-triangulos": "./textures/disenos_manga_clasica/sbdsgnmangas_triangulos_clsc.png",
    "mangas-ondas": "./textures/disenos_manga_clasica/sbdsgnmangas_ondas_clsc.png",
    "mangas-fuego": "./textures/disenos_manga_clasica/sbdsgnmangas_fuego_clsc.png",
    "mangas-hexagonos": "./textures/disenos_manga_clasica/sbdsgnmangas_hexagonos_clsc.png",
    "mangas-animal-print": "./textures/disenos_manga_clasica/sbdsgnmangas_animalprint_clsc.png",
    "mangas-circulos": "./textures/disenos_manga_clasica/sbdsgnmangas_circulos_clsc.png",
    "mangas-cuadros": "./textures/disenos_manga_clasica/sbdsgnmangas_cuadros_clsc.png",
    "mangas-curvas": "./textures/disenos_manga_clasica/sbdsgnmangas_curvas_clsc.png",
    "mangas-floral": "./textures/disenos_manga_clasica/sbdsgnmangas_floral_clsc.png",
    "mangas-picos": "./textures/disenos_manga_clasica/sbdsgnmangas_picos_clsc.png",
    "mangas-abstracto": "./textures/disenos_manga_clasica/sbdsgnmangas_abstracto_clsc.png",
    "mangas-art-deco": "./textures/disenos_manga_clasica/sbdsgnmangas_artdeco_clsc.png",
    "rayas-con-puntos": "./textures/disenos_manga_clasica/sbdsgn2_rayas_con_puntos_1_clsc.png",
    "rayas-con-grunge": "./textures/disenos_manga_clasica/sbdsgn2_rayas_con_grunge_1_clsc.png",
    "rayas-diagonales-dos-colores": "./textures/disenos_manga_clasica/sbdsgn2_rayas_diagonales_1_clsc.png",
    mosaico: "./textures/disenos_manga_clasica/sbdsgn2_mosaico_1_clsc.png",
    "halftone-diagonal": "./textures/disenos_manga_clasica/sbdsgn2_halftone_diagonal_1_clsc.png",
    "2-bastones-con-lineas": "./textures/disenos_manga_clasica/sbdsgn2_2bastones_con_lineas_1_clsc.png",
    "3-bastones-con-lineas": "./textures/disenos_manga_clasica/sbdsgn2_3bastones_con_lineas_1_clsc.png",
    "4-bastones-con-lineas": "./textures/disenos_manga_clasica/sbdsgn2_4bastones_con_lineas_1_clsc.png",
    "marmol-dos-colores": "./textures/disenos_manga_clasica/sbdsgn2_marmol_1_clsc.png",
    formas: "./textures/disenos_manga_clasica/sbdsgn2_formas_1_clsc.png",
    camuflaje: "./textures/disenos_manga_clasica/sbdsgn2_camuflaje_1_clsc.png",
    abstracto: "./textures/disenos_manga_clasica/sbdsgn2_abstracto_1_clsc.png",
    puas: "./textures/disenos_manga_clasica/sbdsgn2_puas_1_clsc.png",
    glitch: "./textures/disenos_manga_clasica/sbdsgn2_glitch_1_clsc.png",
    espinas: "./textures/disenos_manga_clasica/sbdsgn2_espinas_1_clsc.png"
  },
  ranglan: {
    "2-bastones": "./textures/disenos_manga_ranglan/dsgn_2_bastones_rngln.png",
    "3-bastones": "./textures/disenos_manga_ranglan/dsgn_3_bastones_rngln.png",
    "4-bastones": "./textures/disenos_manga_ranglan/dsgn_4_bastones_rngln.png",
    "banda-diagonal": "./textures/disenos_manga_ranglan/dsgn_banda_diagonal_rngln.png",
    "banda-diagonal-2": "./textures/disenos_manga_ranglan/dsgn_banda_diagonal2_rngln.png",
    "franja-horizontal": "./textures/disenos_manga_ranglan/dsgn_franja_hzt_rngln.png",
    chevron: "./textures/disenos_manga_ranglan/dsgn_chevron_rngln.png",
    mitad: "./textures/disenos_manga_ranglan/dsgn_mitad_rngln.png",
    hoops: "./textures/disenos_manga_ranglan/dsgn_hoops_rngln.png",
    hoops2: "./textures/disenos_manga_ranglan/dsgn_hoops2_rngln.png",
    "franja-vertical": "./textures/disenos_manga_ranglan/dsgn_franja_vtc_rngln.png",
    "cuadros-4": "./textures/disenos_manga_ranglan/dsgn_4_cuadros_rngln.png",
    "mitad-diagonal": "./textures/disenos_manga_ranglan/dsgn_mitad_diagonal_rngln.png",
    "mitad-diagonal-2": "./textures/disenos_manga_ranglan/dsgn_mitad_diagonal2_rngln.png",
    pinstripes: "./textures/disenos_manga_ranglan/dsgn_pinstripes_rngln.png",
    cuadros: "./textures/disenos_manga_ranglan/dsgn_cuadros_rngln.png",
    "bloque-superior": "./textures/disenos_manga_ranglan/dsgn_bloque_superior_rngln.png",
    "franja-escudo": "./textures/disenos_manga_ranglan/dsgn2_franja_escudo_1_rngln.png",
    "franja-escudo-2": "./textures/disenos_manga_ranglan/dsgn2_franja_escudo2_1_rngln.png",
    "franja-central": "./textures/disenos_manga_ranglan/dsgn2_franja_central_1_rngln.png",
    "chevron-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_chevron_1_rngln.png",
    "banda-diagonal-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_banda_diagonal_1_rngln.png",
    "banda-diagonal-2-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_banda_diagonal2_1_rngln.png",
    "franja-horizontal-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_franja_hzt_1_rngln.png",
    bandera: "./textures/disenos_manga_ranglan/dsgn2_bandera_1_rngln.png",
    "franja-vertical-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_franja_vtc_1_rngln.png",
    "degrade-linea": "./textures/disenos_manga_ranglan/sbdsgn_degrade_rngln.png",
    ondas: "./textures/disenos_manga_ranglan/sbdsgn_ondas_rngln.png",
    zigzag: "./textures/disenos_manga_ranglan/sbdsgn_zigzag_rngln.png",
    "zigzag-2": "./textures/disenos_manga_ranglan/sbdsgn_zigzag2_rngln.png",
    "rayas-diagonales": "./textures/disenos_manga_ranglan/sbdsgn_rayas_diagonales_rngln.png",
    "lineas-finas": "./textures/disenos_manga_ranglan/sbdsgn_lineas_finas_rngln.png",
    tribal: "./textures/disenos_manga_ranglan/sbdsgn_tribal_rngln.png",
    rocoso: "./textures/disenos_manga_ranglan/sbdsgn_rocoso_rngln.png",
    marmol: "./textures/disenos_manga_ranglan/sbdsgn_marmol_rngln.png",
    halftone: "./textures/disenos_manga_ranglan/sbdsgn_halftone_rngln.png",
    flechas: "./textures/disenos_manga_ranglan/sbdsgn_flechas_rngln.png",
    estrellado: "./textures/disenos_manga_ranglan/sbdsgn_estrellado_rngln.png",
    lineas: "./textures/disenos_manga_ranglan/sbdsgn_lineas_rngln.png",
    "lineas-circulares": "./textures/disenos_manga_ranglan/sbdsgn_lineas_circulares_rngln.png",
    "2-bastones-catalogo": "./textures/disenos_manga_ranglan/sbdsgn_2bastones_rngln.png",
    rombos: "./textures/disenos_manga_ranglan/sbdsgn_rombos_rngln.png",
    grietas: "./textures/disenos_manga_ranglan/sbdsgn_grietas_rngln.png",
    grunge: "./textures/disenos_manga_ranglan/sbdsgn_grunge_rngln.png",
    garra: "./textures/disenos_manga_ranglan/sbdsgn_garra_rngln.png",
    "franja-halftone": "./textures/disenos_manga_ranglan/sbdsgn_franja_halftone_rngln.png",
    olas: "./textures/disenos_manga_ranglan/sbdsgn_olas_rngln.png",
    geometrico: "./textures/disenos_manga_ranglan/sbdsgn_geometrico_rngln.png",
    rafaga: "./textures/disenos_manga_ranglan/sbdsgn_rafaga_rngln.png",
    "mangas-triangulos": "./textures/disenos_manga_ranglan/sbdsgnmangas_triangulos_rngln.png",
    "mangas-ondas": "./textures/disenos_manga_ranglan/sbdsgnmangas_ondas_rngln.png",
    "mangas-fuego": "./textures/disenos_manga_ranglan/sbdsgnmangas_fuego_rngln.png",
    "mangas-hexagonos": "./textures/disenos_manga_ranglan/sbdsgnmangas_hexagonos_rngln.png",
    "mangas-animal-print": "./textures/disenos_manga_ranglan/sbdsgnmangas_animalprint_rngln.png",
    "mangas-circulos": "./textures/disenos_manga_ranglan/sbdsgnmangas_circulos_rngln.png",
    "mangas-cuadros": "./textures/disenos_manga_ranglan/sbdsgnmangas_cuadros_rngln.png",
    "mangas-curvas": "./textures/disenos_manga_ranglan/sbdsgnmangas_curvas_rngln.png",
    "mangas-floral": "./textures/disenos_manga_ranglan/sbdsgnmangas_floral_rngln.png",
    "mangas-picos": "./textures/disenos_manga_ranglan/sbdsgnmangas_picos_rngln.png",
    "mangas-abstracto": "./textures/disenos_manga_ranglan/sbdsgnmangas_abstracto_rngln.png",
    "mangas-art-deco": "./textures/disenos_manga_ranglan/sbdsgnmangas_artdeco_rngln.png",
    "rayas-con-puntos": "./textures/disenos_manga_ranglan/sbdsgn2_rayas_con_puntos_1_rngln.png",
    "rayas-con-grunge": "./textures/disenos_manga_ranglan/sbdsgn2_rayas_con_grunge_1_rngln.png",
    "rayas-diagonales-dos-colores": "./textures/disenos_manga_ranglan/sbdsgn2_rayas_diagonales_1_rngln.png",
    mosaico: "./textures/disenos_manga_ranglan/sbdsgn2_mosaico_1_rngln.png",
    "halftone-diagonal": "./textures/disenos_manga_ranglan/sbdsgn2_halftone_diagonal_1_rngln.png",
    "2-bastones-con-lineas": "./textures/disenos_manga_ranglan/sbdsgn2_2bastones_con_lineas_1_rngln.png",
    "3-bastones-con-lineas": "./textures/disenos_manga_ranglan/sbdsgn2_3bastones_con_lineas_1_rngln.png",
    "4-bastones-con-lineas": "./textures/disenos_manga_ranglan/sbdsgn2_4bastones_con_lineas_1_rngln.png",
    "marmol-dos-colores": "./textures/disenos_manga_ranglan/sbdsgn2_marmol_1_rngln.png",
    formas: "./textures/disenos_manga_ranglan/sbdsgn2_formas_1_rngln.png",
    camuflaje: "./textures/disenos_manga_ranglan/sbdsgn2_camuflaje_1_rngln.png",
    abstracto: "./textures/disenos_manga_ranglan/sbdsgn2_abstracto_1_rngln.png",
    puas: "./textures/disenos_manga_ranglan/sbdsgn2_puas_1_rngln.png",
    glitch: "./textures/disenos_manga_ranglan/sbdsgn2_glitch_1_rngln.png",
    espinas: "./textures/disenos_manga_ranglan/sbdsgn2_espinas_1_rngln.png"
  }
};

const kitSecondaryDesignTexturePaths = {
  classic: {
    "franja-escudo": "./textures/disenos_manga_clasica/dsgn2_franja_escudo_2_clsc.png",
    "franja-escudo-2": "./textures/disenos_manga_clasica/dsgn2_franja_escudo2_2_clsc.png",
    "franja-central": "./textures/disenos_manga_clasica/dsgn2_franja_central_2_clsc.png",
    "chevron-dos-colores": "./textures/disenos_manga_clasica/dsgn2_chevron_2_clsc.png",
    "banda-diagonal-dos-colores": "./textures/disenos_manga_clasica/dsgn2_banda_diagonal_2_clsc.png",
    "banda-diagonal-2-dos-colores": "./textures/disenos_manga_clasica/dsgn2_banda_diagonal2_2_clsc.png",
    "franja-horizontal-dos-colores": "./textures/disenos_manga_clasica/dsgn2_franja_hzt_2_clsc.png",
    bandera: "./textures/disenos_manga_clasica/dsgn2_bandera_2_clsc.png",
    "franja-vertical-dos-colores": "./textures/disenos_manga_clasica/dsgn2_franja_vtc_2_clsc.png",
    "rayas-con-puntos": "./textures/disenos_manga_clasica/sbdsgn2_rayas_con_puntos_2_clsc.png",
    "rayas-con-grunge": "./textures/disenos_manga_clasica/sbdsgn2_rayas_con_grunge_2_clsc.png",
    "rayas-diagonales-dos-colores": "./textures/disenos_manga_clasica/sbdsgn2_rayas_diagonales_2_clsc.png",
    mosaico: "./textures/disenos_manga_clasica/sbdsgn2_mosaico_2_clsc.png",
    "halftone-diagonal": "./textures/disenos_manga_clasica/sbdsgn2_halftone_diagonal_2_clsc.png",
    "2-bastones-con-lineas": "./textures/disenos_manga_clasica/sbdsgn2_2bastones_con_lineas_2_clsc.png",
    "3-bastones-con-lineas": "./textures/disenos_manga_clasica/sbdsgn2_3bastones_con_lineas_2_clsc.png",
    "4-bastones-con-lineas": "./textures/disenos_manga_clasica/sbdsgn2_4bastones_con_lineas_2_clsc.png",
    "marmol-dos-colores": "./textures/disenos_manga_clasica/sbdsgn2_marmol_2_clsc.png",
    formas: "./textures/disenos_manga_clasica/sbdsgn2_formas_2_clsc.png",
    camuflaje: "./textures/disenos_manga_clasica/sbdsgn2_camuflaje_2_clsc.png",
    abstracto: "./textures/disenos_manga_clasica/sbdsgn2_abstracto_2_clsc.png",
    puas: "./textures/disenos_manga_clasica/sbdsgn2_puas_2_clsc.png",
    glitch: "./textures/disenos_manga_clasica/sbdsgn2_glitch_2_clsc.png",
    espinas: "./textures/disenos_manga_clasica/sbdsgn2_espinas_2_clsc.png"
  },
  ranglan: {
    "franja-escudo": "./textures/disenos_manga_ranglan/dsgn2_franja_escudo_2_rngln.png",
    "franja-escudo-2": "./textures/disenos_manga_ranglan/dsgn2_franja_escudo2_2_rngln.png",
    "franja-central": "./textures/disenos_manga_ranglan/dsgn2_franja_central_2_rngln.png",
    "chevron-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_chevron_2_rngln.png",
    "banda-diagonal-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_banda_diagonal_2_rngln.png",
    "banda-diagonal-2-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_banda_diagonal2_2_rngln.png",
    "franja-horizontal-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_franja_hzt_2_rngln.png",
    bandera: "./textures/disenos_manga_ranglan/dsgn2_bandera_2_rngln.png",
    "franja-vertical-dos-colores": "./textures/disenos_manga_ranglan/dsgn2_franja_vtc_2_rngln.png",
    "rayas-con-puntos": "./textures/disenos_manga_ranglan/sbdsgn2_rayas_con_puntos_2_rngln.png",
    "rayas-con-grunge": "./textures/disenos_manga_ranglan/sbdsgn2_rayas_con_grunge_2_rngln.png",
    "rayas-diagonales-dos-colores": "./textures/disenos_manga_ranglan/sbdsgn2_rayas_diagonales_2_rngln.png",
    mosaico: "./textures/disenos_manga_ranglan/sbdsgn2_mosaico_2_rngln.png",
    "halftone-diagonal": "./textures/disenos_manga_ranglan/sbdsgn2_halftone_diagonal_2_rngln.png",
    "2-bastones-con-lineas": "./textures/disenos_manga_ranglan/sbdsgn2_2bastones_con_lineas_2_rngln.png",
    "3-bastones-con-lineas": "./textures/disenos_manga_ranglan/sbdsgn2_3bastones_con_lineas_2_rngln.png",
    "4-bastones-con-lineas": "./textures/disenos_manga_ranglan/sbdsgn2_4bastones_con_lineas_2_rngln.png",
    "marmol-dos-colores": "./textures/disenos_manga_ranglan/sbdsgn2_marmol_2_rngln.png",
    formas: "./textures/disenos_manga_ranglan/sbdsgn2_formas_2_rngln.png",
    camuflaje: "./textures/disenos_manga_ranglan/sbdsgn2_camuflaje_2_rngln.png",
    abstracto: "./textures/disenos_manga_ranglan/sbdsgn2_abstracto_2_rngln.png",
    puas: "./textures/disenos_manga_ranglan/sbdsgn2_puas_2_rngln.png",
    glitch: "./textures/disenos_manga_ranglan/sbdsgn2_glitch_2_rngln.png",
    espinas: "./textures/disenos_manga_ranglan/sbdsgn2_espinas_2_rngln.png"
  }
};

function getCurrentMoldDesignFamily() {
  return selectedMold.startsWith("ranglan") ? "ranglan" : "classic";
}

function isCurrentMoldPolo() {
  return selectedMold.endsWith("-polo");
}

function getKitDesignTexturePath(designId, layer = 1) {
  const family = getCurrentMoldDesignFamily();
  const texturePaths = layer === 2
    ? kitSecondaryDesignTexturePaths
    : kitDesignTexturePaths;

  return (
    texturePaths[family]?.[designId] ||
    texturePaths.classic?.[designId] ||
    ""
  );
}

function getKitPanelTexturePath(textureKey) {
  const texturePath = kitPanelTexturePaths[textureKey];

  if (!texturePath || typeof texturePath === "string") {
    return texturePath || "";
  }

  return (
    texturePath[getCurrentMoldDesignFamily()] ||
    texturePath.classic ||
    ""
  );
}

function getFamilyPlacement(defaultPlacement, familyPlacements) {
  const family = getCurrentMoldDesignFamily();

  return familyPlacements[family] || defaultPlacement;
}

function getStarbadeLogoPlacement(placementKey) {
  return (
    starbadeLogoFamilyPlacements[getCurrentMoldDesignFamily()]?.[placementKey] ||
    starbadeLogoPlacements[placementKey]
  );
}

function getStarbadeLogoStrokePlacement(placementKey) {
  return (
    starbadeLogoStrokeFamilyPlacements[getCurrentMoldDesignFamily()]?.[placementKey] ||
    starbadeLogoStrokePlacements[placementKey]
  );
}

function getFrontShieldPlacement() {
  const placement = getFamilyPlacement(frontShieldPlacement, frontShieldFamilyPlacements);

  if (kitDesignState.selectedDesign === "zigzag") {
    return {
      ...placement,
      x: placement.x + 6
    };
  }

  return placement;
}

function getFrontSponsorPlacement() {
  const placement = getFamilyPlacement(frontSponsorPlacement, frontSponsorFamilyPlacements);

  if (
    kitDesignState.selectedDesign === "chevron"
    || kitDesignState.selectedDesign === "chevron-dos-colores"
  ) {
    return {
      ...placement,
      y: placement.y + 60
    };
  }

  return placement;
}

function getBackSponsorPlacement() {
  return getFamilyPlacement(backSponsorPlacement, backSponsorFamilyPlacements);
}

function getBackDorsalNumberPlacement() {
  return getFamilyPlacement(backDorsalNumberPlacement, backDorsalNumberFamilyPlacements);
}

function getBackDorsalNumberStrokePlacement() {
  return getFamilyPlacement(
    backDorsalNumberStrokePlacement,
    backDorsalNumberStrokeFamilyPlacements
  );
}

function getBackDorsalNamePlacement() {
  return getFamilyPlacement(backDorsalNamePlacement, backDorsalNameFamilyPlacements);
}

function getBackDorsalNameStrokePlacement() {
  return getFamilyPlacement(
    backDorsalNameStrokePlacement,
    backDorsalNameStrokeFamilyPlacements
  );
}

const singleColorDesignRules = {
  "2-bastones": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: false,
    backLogoMatchesDesign: true
  },
  "3-bastones": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "4-bastones": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "banda-diagonal": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "banda-diagonal-2": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: false,
    backLogoMatchesDesign: true
  },
  "franja-horizontal": {
    nameStroke: false,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  chevron: {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: false,
    backLogoMatchesDesign: true
  },
  mitad: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: true,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  hoops: {
    // This row corresponds to the second "Chevron" entry supplied after Mitad.
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: false
  },
  hoops2: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: false
  },
  "franja-vertical": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: false,
    backLogoMatchesDesign: false
  },
  "cuadros-4": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mitad-diagonal": {
    nameStroke: false,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: false,
    backLogoMatchesDesign: false
  },
  "mitad-diagonal-2": {
    nameStroke: false,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: false,
    backLogoMatchesDesign: false
  },
  pinstripes: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  cuadros: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "bloque-superior": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: false,
    backLogoMatchesDesign: false
  },
  "degrade-linea": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  ondas: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  zigzag: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "zigzag-2": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "rayas-diagonales": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "lineas-finas": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  tribal: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  rocoso: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  marmol: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  halftone: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  flechas: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  estrellado: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  lineas: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "lineas-circulares": {
    nameStroke: true,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "2-bastones-catalogo": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: false,
    backLogoMatchesDesign: true
  },
  rombos: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  grietas: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  grunge: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  garra: {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "franja-halftone": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  olas: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  geometrico: {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: true,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  rafaga: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-triangulos": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-ondas": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-fuego": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-hexagonos": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-animal-print": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-circulos": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-cuadros": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-curvas": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-floral": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-picos": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-abstracto": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  },
  "mangas-art-deco": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false,
    frontLogoMatchesDesign: true,
    backLogoMatchesDesign: true
  }
};

const twoColorDesignRules = {
  "franja-escudo": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false
  },
  "franja-escudo-2": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: true,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: false
  },
  "franja-central": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false
  },
  "chevron-dos-colores": {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: true,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: false
  },
  "banda-diagonal-dos-colores": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false
  },
  "banda-diagonal-2-dos-colores": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: false
  },
  "franja-horizontal-dos-colores": {
    nameStroke: false,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false
  },
  bandera: {
    nameStroke: false,
    numberStroke: false,
    frontLogoStroke: true,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: false
  },
  "franja-vertical-dos-colores": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  "rayas-con-puntos": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  "rayas-con-grunge": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  "rayas-diagonales-dos-colores": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  mosaico: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  "halftone-diagonal": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  "2-bastones-con-lineas": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: false
  },
  "3-bastones-con-lineas": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  "4-bastones-con-lineas": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  "marmol-dos-colores": {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  formas: {
    nameStroke: false,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false
  },
  camuflaje: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  abstracto: {
    nameStroke: false,
    numberStroke: true,
    frontLogoStroke: false,
    backLogoStroke: false,
    frontLogoMatchesMaterial: false,
    backLogoMatchesMaterial: false
  },
  puas: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  glitch: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  },
  espinas: {
    nameStroke: true,
    numberStroke: true,
    frontLogoStroke: true,
    backLogoStroke: true,
    frontLogoMatchesMaterial: true,
    backLogoMatchesMaterial: true
  }
};

const ranglanSleevePanelBlockedDesigns = new Set([
  "2-bastones",
  "3-bastones",
  "4-bastones",
  "hoops",
  "hoops2",
  "pinstripes",
  "zigzag",
  "2-bastones-catalogo",
  "rayas-con-puntos",
  "rayas-con-grunge",
  "2-bastones-con-lineas",
  "3-bastones-con-lineas",
  "4-bastones-con-lineas",
  "mangas-triangulos",
  "mangas-ondas",
  "mangas-fuego",
  "mangas-hexagonos",
  "mangas-animal-print",
  "mangas-circulos",
  "mangas-cuadros",
  "mangas-curvas",
  "mangas-floral",
  "mangas-picos",
  "mangas-abstracto",
  "mangas-art-deco"
]);

const kitPanelTexturePaths = {
  shoulder: {
    classic: "./textures/disenos_manga_clasica/dsgn_hombros_clsc.png",
    ranglan: "./textures/disenos_manga_ranglan/dsgn_mangas_rngln.png"
  },
  shoulderBorder: {
    classic: "./textures/disenos_manga_clasica/dsgn_hombros_borde_clsc.png",
    ranglan: "./textures/disenos_manga_ranglan/dsgn_mangas_borde_rngln.png"
  },
  side: {
    classic: "./textures/disenos_manga_clasica/dsgn_laterales_clsc.png",
    ranglan: "./textures/disenos_manga_ranglan/dsgn_laterales_rngln.png"
  },
  sideBorder: {
    classic: "./textures/disenos_manga_clasica/dsgn_laterales_borde_clsc.png",
    ranglan: "./textures/disenos_manga_ranglan/dsgn_laterales_borde_rngln.png"
  },
  neckLine: {
    classic: "./textures/disenos_manga_clasica/dsgn_lineas_cuello_clsc.png",
    ranglan: "./textures/disenos_manga_ranglan/dsgn_lineas_cuello_rngln.png"
  },
  neckLinePolo: {
    classic: "./textures/disenos_manga_clasica/dsgn_lineas_cuello_polo_clsc.png",
    ranglan: "./textures/disenos_manga_ranglan/dsgn_lineas_cuello_polo_rngln.png"
  },
  cuffLine: {
    classic: "./textures/disenos_manga_clasica/dsgn_lineas_punos_clsc.png",
    ranglan: "./textures/disenos_manga_ranglan/dsgn_lineas_punos_rngln.png"
  },
  shortFineLine: "./textures/disenos_comun/dsgn_short_fina.png",
  shortThickLine: "./textures/disenos_comun/dsgn_short_gruesa.png",
  shortBottomLine: "./textures/disenos_comun/dsgn_short_inferior.png"
};

const starbadeLogoTexturePath = "./textures/starbade_white.png";
const starbadeLogoStrokeTexturePath = "./textures/starbade_white_stroke.png";
const starbadeLogoUvCanvasSize = 2048;
const starbadeLogoPlacements = {
  front: {
    x: 196,
    y: 859,
    width: 123,
    height: 25
  },
  back: {
    x: 1122,
    y: 997,
    width: 123,
    height: 25
  },
  shortLeft: {
    x: 262,
    y: 440,
    width: 123,
    height: 25
  }
};

const starbadeLogoFamilyPlacements = {
  ranglan: {
    front: {
      ...starbadeLogoPlacements.front,
      x: 182,
      y: 808
    },
    back: {
      ...starbadeLogoPlacements.back,
      x: 1570,
      y: 637
    }
  }
};

const starbadeLogoStrokePlacements = {
  front: {
    x: 193,
    y: 856,
    width: 129,
    height: 31
  },
  back: {
    x: 1119,
    y: 994,
    width: 129,
    height: 31
  }
};

const starbadeLogoStrokeFamilyPlacements = {
  ranglan: {
    front: {
      ...starbadeLogoStrokePlacements.front,
      x: 179,
      y: 805
    },
    back: {
      ...starbadeLogoStrokePlacements.back,
      x: 1567,
      y: 634
    }
  }
};

const frontShieldPlacement = {
  x: 480,
  y: 808,
  width: 128,
  height: 128
};

const frontShieldFamilyPlacements = {
  ranglan: {
    ...frontShieldPlacement,
    x: 467,
    y: 757
  }
};

const frontSponsorPlacement = {
  x: 226,
  y: 1009,
  width: 350,
  height: 175
};

const frontSponsorFamilyPlacements = {
  ranglan: {
    ...frontSponsorPlacement,
    x: 212,
    y: 958
  }
};

const backSponsorPlacement = {
  x: 1009,
  y: 1679,
  width: 350,
  height: 175
};

const backSponsorFamilyPlacements = {
  ranglan: {
    ...backSponsorPlacement,
    x: 1457,
    y: 1319
  }
};

const shortShieldPlacement = {
  x: 1610,
  y: 340,
  width: 128,
  height: 128
};

const shortDorsalNumberPlacement = {
  x: 260,
  y: 282,
  width: 123,
  height: 147
};

const backDorsalNumberPlacement = {
  x: 1018,
  y: 1235,
  width: 332,
  height: 402
};

const backDorsalNumberStrokePlacement = {
  ...backDorsalNumberPlacement,
  y: backDorsalNumberPlacement.y - 9
};

const backDorsalNumberFamilyPlacements = {
  ranglan: {
    ...backDorsalNumberPlacement,
    x: 1466,
    y: 875
  }
};

const backDorsalNumberStrokeFamilyPlacements = {
  ranglan: {
    ...backDorsalNumberFamilyPlacements.ranglan,
    y: backDorsalNumberFamilyPlacements.ranglan.y - 9
  }
};

const backDorsalNamePlacement = {
  x: 1019,
  y: 1085,
  width: 329,
  height: 95
};

const backDorsalNameStrokePlacement = {
  ...backDorsalNamePlacement,
  y: backDorsalNamePlacement.y + 4
};

const backDorsalNameFamilyPlacements = {
  ranglan: {
    ...backDorsalNamePlacement,
    x: 1467,
    y: 725
  }
};

const backDorsalNameStrokeFamilyPlacements = {
  ranglan: {
    ...backDorsalNameFamilyPlacements.ranglan,
    y: backDorsalNameFamilyPlacements.ranglan.y + 4
  }
};

const shieldUploadInput = document.getElementById("shieldUploadInput");
const shieldUploadPreview = document.getElementById("shieldUploadPreview");
const shieldUploadText = document.getElementById("shieldUploadText");
const shieldUploadBox = document.querySelector(".shield-upload-box");
const shieldApplyBtn = document.querySelector(".shield-apply-btn");
const shieldDeleteBtn = document.querySelector(".shield-delete-btn");
const shieldWarningPopup = document.getElementById("shieldWarningPopup");
const shieldButtonIcon = document.getElementById("shieldButtonIcon");
const mobileShieldButtonIcon = document.getElementById("mobileShieldButtonIcon");
const addShieldBtnText = addShieldBtn.querySelector("span");
const mobileAddShieldBtnText = mobileAddShieldBtn.querySelector("span");

const sponsorUploadInput = document.getElementById("sponsorUploadInput");
const sponsorUploadPreview = document.getElementById("sponsorUploadPreview");
const sponsorUploadText = document.getElementById("sponsorUploadText");
const sponsorUploadBox = document.querySelector(".sponsor-upload-box");
const sponsorApplyBtn = document.querySelector(".sponsor-apply-btn");
const sponsorDeleteBtn = document.querySelector(".sponsor-delete-btn");
const sponsorWarningPopup = document.getElementById("sponsorWarningPopup");
const sponsorButtonIcon = document.getElementById("sponsorButtonIcon");
const mobileSponsorButtonIcon = document.getElementById("mobileSponsorButtonIcon");
const addSponsorBtnText = addSponsorBtn.querySelector("span");
const mobileAddSponsorBtnText = mobileAddSponsorBtn.querySelector("span");
const sponsorPanelHeader = sponsorPanel.querySelector(".design-panel-header");
const sponsorPanelNote = sponsorPanel.querySelector(".design-panel-note");
const backSponsorUploadInput = document.getElementById("backSponsorUploadInput");
const backSponsorUploadPreview = document.getElementById("backSponsorUploadPreview");
const backSponsorUploadText = document.getElementById("backSponsorUploadText");
const backSponsorUploadBox = backSponsorPanel.querySelector(".sponsor-upload-box");
const backSponsorApplyBtn = document.querySelector(".back-sponsor-apply-btn");
const backSponsorDeleteBtn = document.querySelector(".back-sponsor-delete-btn");
const backSponsorWarningPopup = document.getElementById("backSponsorWarningPopup");
const backSponsorButtonIcon = document.getElementById("backSponsorButtonIcon");
const mobileBackSponsorButtonIcon = document.getElementById("mobileBackSponsorButtonIcon");
const backSponsorBtnText = backSponsorBtn.querySelector("span");
const mobileBackSponsorBtnText = mobileBackSponsorBtn.querySelector("span");
const backSponsorPanelHeader = backSponsorPanel.querySelector(".design-panel-header");
const backSponsorPanelNote = backSponsorPanel.querySelector(".design-panel-note");

const starbadeLogoColorBtn = document.getElementById("starbadeLogoColorBtn");
const mobileStarbadeLogoColorBtn = document.getElementById("mobileStarbadeLogoColorBtn");
const starbadeLogoPreviewCircle = document.getElementById("starbadeLogoPreviewCircle");
const mobileStarbadeLogoPreviewCircle = document.getElementById("mobileStarbadeLogoPreviewCircle");
const starbadeStrokeColorBtn = document.getElementById("starbadeStrokeColorBtn");
const mobileStarbadeStrokeColorBtn = document.getElementById("mobileStarbadeStrokeColorBtn");
const starbadeStrokeToggle = document.getElementById("starbadeStrokeToggle");
const mobileStarbadeStrokeToggle = document.getElementById("mobileStarbadeStrokeToggle");
const starbadeStrokePreviewCircle = document.getElementById("starbadeStrokePreviewCircle");
const mobileStarbadeStrokePreviewCircle = document.getElementById("mobileStarbadeStrokePreviewCircle");
const backStarbadeLogoColorBtn = document.getElementById("backStarbadeLogoColorBtn");
const mobileBackStarbadeLogoColorBtn = document.getElementById("mobileBackStarbadeLogoColorBtn");
const backStarbadeLogoPreviewCircle = document.getElementById("backStarbadeLogoPreviewCircle");
const mobileBackStarbadeLogoPreviewCircle = document.getElementById("mobileBackStarbadeLogoPreviewCircle");
const backStarbadeStrokeColorBtn = document.getElementById("backStarbadeStrokeColorBtn");
const mobileBackStarbadeStrokeColorBtn = document.getElementById("mobileBackStarbadeStrokeColorBtn");
const backStarbadeStrokeToggle = document.getElementById("backStarbadeStrokeToggle");
const mobileBackStarbadeStrokeToggle = document.getElementById("mobileBackStarbadeStrokeToggle");
const backStarbadeStrokePreviewCircle = document.getElementById("backStarbadeStrokePreviewCircle");
const mobileBackStarbadeStrokePreviewCircle = document.getElementById("mobileBackStarbadeStrokePreviewCircle");

const dorsalNumberColorBtn = document.getElementById("dorsalNumberColorBtn");
const mobileDorsalNumberColorBtn = document.getElementById("mobileDorsalNumberColorBtn");
const dorsalNumberToggle = document.getElementById("dorsalNumberToggle");
const mobileDorsalNumberToggle = document.getElementById("mobileDorsalNumberToggle");
const dorsalNumberPreviewCircle = document.getElementById("dorsalNumberPreviewCircle");
const mobileDorsalNumberPreviewCircle = document.getElementById("mobileDorsalNumberPreviewCircle");
const dorsalNumberStrokeColorBtn = document.getElementById("dorsalNumberStrokeColorBtn");
const mobileDorsalNumberStrokeColorBtn = document.getElementById("mobileDorsalNumberStrokeColorBtn");
const dorsalNumberStrokeToggle = document.getElementById("dorsalNumberStrokeToggle");
const mobileDorsalNumberStrokeToggle = document.getElementById("mobileDorsalNumberStrokeToggle");
const dorsalNumberStrokePreviewCircle = document.getElementById("dorsalNumberStrokePreviewCircle");
const mobileDorsalNumberStrokePreviewCircle = document.getElementById("mobileDorsalNumberStrokePreviewCircle");

const dorsalNameColorBtn = document.getElementById("dorsalNameColorBtn");
const mobileDorsalNameColorBtn = document.getElementById("mobileDorsalNameColorBtn");
const dorsalNameToggle = document.getElementById("dorsalNameToggle");
const mobileDorsalNameToggle = document.getElementById("mobileDorsalNameToggle");
const dorsalNamePreviewCircle = document.getElementById("dorsalNamePreviewCircle");
const mobileDorsalNamePreviewCircle = document.getElementById("mobileDorsalNamePreviewCircle");
const dorsalNameStrokeColorBtn = document.getElementById("dorsalNameStrokeColorBtn");
const mobileDorsalNameStrokeColorBtn = document.getElementById("mobileDorsalNameStrokeColorBtn");
const dorsalNameStrokeToggle = document.getElementById("dorsalNameStrokeToggle");
const mobileDorsalNameStrokeToggle = document.getElementById("mobileDorsalNameStrokeToggle");
const dorsalNameStrokePreviewCircle = document.getElementById("dorsalNameStrokePreviewCircle");
const mobileDorsalNameStrokePreviewCircle = document.getElementById("mobileDorsalNameStrokePreviewCircle");

const shortShieldBtn = document.getElementById("shortShieldBtn");
const mobileShortShieldBtn = document.getElementById("mobileShortShieldBtn");
const shortShieldToggle = document.getElementById("shortShieldToggle");
const mobileShortShieldToggle = document.getElementById("mobileShortShieldToggle");
const shortShieldButtonIcon = document.getElementById("shortShieldButtonIcon");
const mobileShortShieldButtonIcon = document.getElementById("mobileShortShieldButtonIcon");
const shortNumberColorBtn = document.getElementById("shortNumberColorBtn");
const mobileShortNumberColorBtn = document.getElementById("mobileShortNumberColorBtn");
const shortNumberToggle = document.getElementById("shortNumberToggle");
const mobileShortNumberToggle = document.getElementById("mobileShortNumberToggle");
const shortNumberPreviewCircle = document.getElementById("shortNumberPreviewCircle");
const mobileShortNumberPreviewCircle = document.getElementById("mobileShortNumberPreviewCircle");
const shortStarbadeLogoColorBtn = document.getElementById("shortStarbadeLogoColorBtn");
const mobileShortStarbadeLogoColorBtn = document.getElementById("mobileShortStarbadeLogoColorBtn");
const shortStarbadeLogoPreviewCircle = document.getElementById("shortStarbadeLogoPreviewCircle");
const mobileShortStarbadeLogoPreviewCircle = document.getElementById("mobileShortStarbadeLogoPreviewCircle");

const dorsalTypeOverlay = document.getElementById("dorsalTypeOverlay");
const dorsalTypePanel = document.getElementById("dorsalTypePanel");
const closeDorsalTypePanel = document.getElementById("closeDorsalTypePanel");
const dorsalTypeBtn = document.getElementById("dorsalTypeBtn");
const mobileDorsalTypeBtn = document.getElementById("mobileDorsalTypeBtn");
const dorsalTypeButtonIcon = document.getElementById("dorsalTypeButtonIcon");
const mobileDorsalTypeButtonIcon = document.getElementById("mobileDorsalTypeButtonIcon");

const dorsalVariant10Btn = document.getElementById("dorsalVariant10Btn");
const dorsalVariant1Btn = document.getElementById("dorsalVariant1Btn");

const dorsalFontPicker = document.getElementById("dorsalFontPicker");
const dorsalFontDropdownBtn = document.getElementById("dorsalFontDropdownBtn");
const dorsalFontDropdownLabel = document.getElementById("dorsalFontDropdownLabel");
const dorsalFontDropdownMenu = document.getElementById("dorsalFontDropdownMenu");
const dorsalFontOptions = document.querySelectorAll(".dorsal-font-option");
const dorsalNamePreviewImage = document.getElementById("dorsalNamePreviewImage");
const dorsalNumberPreviewImage = document.getElementById("dorsalNumberPreviewImage");

const defaultLogoIcon = "./textures/icons/icon_escudo.png";

const visualAssetState = {
  shield: {
    file: null,
    previewUrl: "",
    uvLayer: "frontShield"
  },
  sponsor: {
    file: null,
    previewUrl: "",
    uvLayer: "frontSponsor"
  },
  backSponsor: {
    file: null,
    previewUrl: "",
    uvLayer: "backSponsor"
  }
};

const starbadeLogoState = {
  logoColor: initialWhite,
  strokeColor: initialBlack,
  strokeEnabled: false,

  backLogoColor: initialWhite,
  backStrokeColor: initialBlack,
  backStrokeEnabled: false,

  uvLayers: {
    frontLogo: "frontStarbadeLogo",
    frontStroke: "frontStarbadeLogoStroke",
    backLogo: "backStarbadeLogo",
    backStroke: "backStarbadeLogoStroke"
  }
};

const dorsalNumberState = {
  numberColor: initialBlackMid,
  strokeColor: initialWhiteMid,
  nameColor: initialBlackMid,
  nameStrokeColor: initialWhiteMid,
  numberEnabled: false,
  strokeEnabled: false,
  nameEnabled: false,
  nameStrokeEnabled: false,
  uvLayers: {
    backNumber: "backDorsalNumber",
    backNumberStroke: "backDorsalNumberStroke",
    backName: "backDorsalName",
    backNameStroke: "backDorsalNameStroke"
  }
};

const shortLogoState = {
  shieldEnabled: false,
  numberColor: initialRed,
  numberEnabled: false,
  starbadeLogoColor: initialRed,
  uvLayers: {
    shield: "shortShield",
    number: "shortNumber",
    starbadeLogo: "shortStarbadeLogo"
  }
};

let selectedDesign = "sin-diseno";
let selectedDorsalVariant = "10";
let selectedDorsalFont = "ariq";

function normalizeSponsorPanelText() {
  closeSponsorPanel.textContent = "\u00d7";
  closeBackSponsorPanel.textContent = "\u00d7";
  sponsorPanelHeader.textContent = "Agregar Sponsor (Frente)";
  backSponsorPanelHeader.textContent = "Agregar Sponsor (Espalda)";
  sponsorPanelNote.innerHTML = "<strong>IMPORTANTE:</strong> Te recomendamos subir tu sponsor en formato .PNG, con fondo transparente y un tama\u00f1o m\u00ednimo de 350\u00d7175 p\u00edxeles para garantizar una mejor calidad. Cuando pidas la cotizaci\u00f3n, nuestro equipo de dise\u00f1o puede sumar los sponsors adicionales que necesites.";
  backSponsorPanelNote.innerHTML = sponsorPanelNote.innerHTML;
}

function disableImageActions() {
  const images = document.querySelectorAll("img");

  images.forEach((img) => {
    const src = img.getAttribute("src") || "";

    const isProtected =
      img.classList.contains("dorsal-preview-image") ||
      img.classList.contains("design-action-icon") ||
      img.closest(".traditional-designs-item") ||
      img.closest("#dorsalTypeBtn") ||
      img.closest("#mobileDorsalTypeBtn") ||
      src.includes("icon_") ||
      src.includes("facebook") ||
      src.includes("instagram");

    if (!isProtected) return;

    img.setAttribute("draggable", "false");

    img.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    img.addEventListener("dragstart", (e) => {
      e.preventDefault();
    });
  });
}

function preventAccidentalManualZoom() {
  let lastTouchEnd = 0;

  document.addEventListener("touchmove", (event) => {
    if (event.touches.length < 2) return;
    event.preventDefault();
  }, { passive: false });

  document.addEventListener("touchend", (event) => {
    const now = Date.now();

    if (now - lastTouchEnd <= 350) {
      event.preventDefault();
    }

    lastTouchEnd = now;
  }, { passive: false });

  document.addEventListener("dblclick", (event) => {
    event.preventDefault();
  }, { passive: false });

  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(eventName, (event) => {
      event.preventDefault();
    }, { passive: false });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  disableImageActions();
  preventAccidentalManualZoom();
  applyThemeMode(getStoredThemeMode());
  setupPerformanceWarning();
});

function closeMobileMenu() {
  mobileMenu.classList.remove("active");
}

function syncThemeModeButtons() {
  const isDark = document.body.classList.contains("theme-dark");

  [themeModeToggle, mobileThemeModeToggle].forEach((button) => {
    if (!button) return;

    button.setAttribute("aria-pressed", String(isDark));
    button.setAttribute(
      "aria-label",
      isDark ? "Activar modo claro" : "Activar modo oscuro"
    );
  });
}

function getStoredThemeMode() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
  } catch (error) {
    return "dark";
  }
}

function saveThemeMode(mode) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch (error) {
    // Ignore storage restrictions and keep the current page state.
  }
}

function hasDismissedPerformanceWarning() {
  try {
    return localStorage.getItem(PERFORMANCE_WARNING_STORAGE_KEY) === "1";
  } catch (error) {
    return false;
  }
}

function saveDismissedPerformanceWarning() {
  try {
    localStorage.setItem(PERFORMANCE_WARNING_STORAGE_KEY, "1");
  } catch (error) {
    // Ignore storage restrictions and keep the warning dismissible for this visit.
  }
}

function getWebGlContext(canvas, options = {}) {
  return canvas.getContext("webgl2", options)
    || canvas.getContext("webgl", options)
    || canvas.getContext("experimental-webgl", options);
}

function getWebGlPerformanceInfo() {
  const canvas = document.createElement("canvas");
  const gl = getWebGlContext(canvas, { failIfMajorPerformanceCaveat: false });

  if (!gl) {
    return {
      supported: false,
      renderer: "",
      vendor: "",
      softwareRenderer: false,
      majorPerformanceCaveat: false
    };
  }

  let renderer = "";
  let vendor = "";

  try {
    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");

    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "";
    }

    renderer = renderer || gl.getParameter(gl.RENDERER) || "";
    vendor = vendor || gl.getParameter(gl.VENDOR) || "";
  } catch (error) {
    renderer = "";
    vendor = "";
  }

  const rendererText = `${renderer} ${vendor}`.toLowerCase();
  const softwareRendererNames = [
    "swiftshader",
    "warp",
    "microsoft basic render driver",
    "software rasterizer",
    "llvmpipe",
    "softpipe",
    "mesa offscreen",
    "gdi generic"
  ];
  const caveatCanvas = document.createElement("canvas");
  const caveatGl = getWebGlContext(caveatCanvas, { failIfMajorPerformanceCaveat: true });

  return {
    supported: true,
    renderer,
    vendor,
    softwareRenderer: softwareRendererNames.some((name) => rendererText.includes(name)),
    majorPerformanceCaveat: !caveatGl
  };
}

function openPerformanceWarningPanel(reason = "slow") {
  if (hasDismissedPerformanceWarning() || !performanceWarningPanel || !performanceWarningOverlay) return;

  const warningCopy = reason === "no-webgl"
    ? {
      title: "Vista 3D no disponible",
      text: "Este navegador no puede cargar la vista 3D del configurador. Probá actualizarlo o abrir la página desde otro navegador actualizado."
    }
    : {
      title: "Rendimiento de la Vista 3D",
      text: "Notamos que la vista 3D puede funcionar lenta en este dispositivo. Para mejorar la rotación, podés probar actualizar tu navegador o activar la aceleración por gráficos en su configuración."
    };

  if (performanceWarningTitle) {
    performanceWarningTitle.textContent = warningCopy.title;
  }

  if (performanceWarningText) {
    performanceWarningText.textContent = warningCopy.text;
  }

  if (performanceWarningDontShow) {
    performanceWarningDontShow.checked = false;
  }

  performanceWarningOverlay.classList.add("active");
  performanceWarningPanel.classList.add("active");

  document.body.style.overflow = "hidden";
}

function setupPerformanceWarning() {
  if (!performanceWarningPanel || hasDismissedPerformanceWarning()) return;

  const performanceInfo = getWebGlPerformanceInfo();

  if (!performanceInfo.supported) {
    openPerformanceWarningPanel("no-webgl");
    return;
  }

  if (performanceInfo.softwareRenderer || performanceInfo.majorPerformanceCaveat) {
    openPerformanceWarningPanel("slow");
  }
}

function getLightIconSrc(src) {
  return src.replace(/_dark(\.[a-z0-9]+)(\?.*)?$/i, "$1$2");
}

function getDarkIconSrc(src) {
  return getLightIconSrc(src).replace(/(\.[a-z0-9]+)(\?.*)?$/i, "_dark$1$2");
}

function setThemeableIconSrc(image, lightSrc) {
  if (!image || !lightSrc) return;

  const normalizedLightSrc = getLightIconSrc(lightSrc);
  image.dataset.lightSrc = normalizedLightSrc;
  image.dataset.darkSrc = getDarkIconSrc(normalizedLightSrc);
  image.dataset.darkFallbackApplied = "false";
  image.src = document.body.classList.contains("theme-dark")
    ? image.dataset.darkSrc
    : image.dataset.lightSrc;
}

function syncThemedIconSources() {
  const isDark = document.body.classList.contains("theme-dark");
  const themedImages = document.querySelectorAll(
    ".traditional-designs-item img, .mold-option-item img"
  );

  themedImages.forEach((image) => {
    const lightSrc = image.dataset.lightSrc || getLightIconSrc(image.getAttribute("src") || "");
    setThemeableIconSrc(image, lightSrc);
  });

  [addDesignBtn?.querySelector("img"), mobileAddDesignBtn?.querySelector("img")].forEach((image) => {
    if (!image?.dataset.lightSrc) return;

    image.dataset.darkFallbackApplied = "false";
    image.src = isDark ? image.dataset.darkSrc : image.dataset.lightSrc;
  });
}

document.addEventListener("error", (event) => {
  const image = event.target;
  if (!(image instanceof HTMLImageElement)) return;
  if (image.dataset.darkFallbackApplied === "true") return;
  if (!image.dataset.lightSrc || image.src === image.dataset.lightSrc) return;

  image.dataset.darkFallbackApplied = "true";
  image.src = image.dataset.lightSrc;
}, true);

function applyThemeMode(mode, shouldSave = false) {
  const normalizedMode = mode === "light" ? "light" : "dark";

  document.body.classList.toggle("theme-dark", normalizedMode === "dark");
  window.starbadeViewer3D?.setThemeMode?.(normalizedMode);

  if (shouldSave) {
    saveThemeMode(normalizedMode);
  }

  syncThemeModeButtons();
  syncThemedIconSources();
}

function toggleThemeMode() {
  const nextMode = document.body.classList.contains("theme-dark") ? "light" : "dark";

  applyThemeMode(nextMode, true);
}

menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("active");
});

[themeModeToggle, mobileThemeModeToggle].forEach((button) => {
  button?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleThemeMode();
  });
});

document.addEventListener("click", (event) => {
  if (!mobileMenu.classList.contains("active")) return;
  if (
    mobileMenu.contains(event.target) ||
    menuBtn.contains(event.target) ||
    mobileThemeModeToggle?.contains(event.target)
  ) return;

  closeMobileMenu();
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});

function syncQuotePanelCollapseState() {
  const isCollapsed = mainLayout?.classList.contains("quote-panel-collapsed");

  if (!quoteCollapseToggle) return;

  quoteCollapseToggle.textContent = isCollapsed ? "\u2039" : "\u203A";
  quoteCollapseToggle.setAttribute(
    "aria-label",
    isCollapsed ? "Abrir panel de cotización" : "Cerrar panel de cotización"
  );
  quoteCollapseToggle.setAttribute("aria-expanded", String(!isCollapsed));
}

quoteCollapseToggle?.addEventListener("click", () => {
  mainLayout?.classList.toggle("quote-panel-collapsed");
  syncQuotePanelCollapseState();

  window.setTimeout(() => {
    window.starbadeViewer3D?.resize?.();
  }, 300);
});

syncQuotePanelCollapseState();

const designTab = document.getElementById("designTab");
const quoteTab = document.getElementById("quoteTab");

const mobileDesignView = document.getElementById("mobileDesignView");
const mobileQuoteView = document.getElementById("mobileQuoteView");

designTab.addEventListener("click", () => {

  designTab.classList.add("active");
  quoteTab.classList.remove("active");

  mobileDesignView.classList.add("active");
  mobileQuoteView.classList.remove("active");

});

quoteTab.addEventListener("click", () => {

  quoteTab.classList.add("active");
  designTab.classList.remove("active");

  mobileQuoteView.classList.add("active");
  mobileDesignView.classList.remove("active");

});

const designSectionTabs = document.querySelectorAll(".design-section-tab");

function setDesignSection(scope, sectionKey) {
  const tabs = scope.querySelectorAll(".design-section-tab");

  const sectionsContainer = scope.classList.contains("desktop-left-panel")
    ? scope.querySelector(".desktop-panel-scroll")
    : scope.querySelector(".mobile-design-scroll");

  const sections = sectionsContainer.querySelectorAll(".design-panel-section");

  tabs.forEach((item) => {
    item.classList.toggle("active", item.dataset.section === sectionKey);
  });

  sections.forEach((section) => {
    section.classList.toggle("active", section.dataset.section === sectionKey);
  });
}

designSectionTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const scope = tab.closest(".desktop-left-panel, .mobile-design-view");
    if (!scope) return;

    setDesignSection(scope, tab.dataset.section);
  });
});

document.querySelectorAll(".desktop-left-panel, .mobile-design-view").forEach((scope) => {
  const initialTab = scope.querySelector('.design-section-tab.active') || scope.querySelector(".design-section-tab");
  if (!initialTab) return;

  setDesignSection(scope, initialTab.dataset.section);
});

function setKitCameraView(view) {
  kitCameraState.view = view;

  kitViewButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.cameraView === view);
  });

  kitCameraState.applyView?.(view);
}

kitViewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setKitCameraView(button.dataset.cameraView);
  });
});

function downloadBlob(blob, filename) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 1000);
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = async () => {
      try {
        await image.decode?.();
      } catch (error) {
        // Some browsers reject decode() for already loaded PNGs; onload is enough.
      }

      resolve(image);
    };
    image.onerror = reject;
    image.src = src;
  });
}

async function loadFirstAvailableImageElement(sources) {
  const errors = [];

  for (const source of sources) {
    try {
      return await loadImageElement(source);
    } catch (error) {
      errors.push(error);
    }
  }

  throw errors[errors.length - 1] || new Error("No se pudo cargar ninguna imagen.");
}

function waitForAnimationFrames(count = 1) {
  return new Promise((resolve) => {
    let resolved = false;
    const finish = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };
    const step = (remaining) => {
      if (resolved) return;

      if (remaining <= 0) {
        finish();
        return;
      }

      requestAnimationFrame(() => step(remaining - 1));
    };

    window.setTimeout(finish, Math.max(80, count * 120));
    step(count);
  });
}

async function waitForDocumentFontsReady() {
  try {
    await document.fonts?.ready;
  } catch (error) {
    // Font readiness is a polish step; export can continue with browser fallback fonts.
  }
}

function dataUrlToBlob(dataUrl) {
  const [header, data] = String(dataUrl || "").split(",");
  const mimeMatch = header.match(/^data:([^;]+)/);
  const mimeType = mimeMatch?.[1] || "image/png";
  const binary = atob(data || "");
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

function canvasToBlob(canvas, type = "image/png") {
  return new Promise((resolve) => {
    const fallback = () => {
      try {
        resolve(dataUrlToBlob(canvas.toDataURL(type)));
      } catch (error) {
        resolve(null);
      }
    };

    if (!canvas?.toBlob) {
      fallback();
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      fallback();
    }, type);
  });
}

function getDesignImageFilename() {
  const date = new Date();
  const timestamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0")
  ].join("");

  return `starbade-diseno-${timestamp}.png`;
}

function getQuoteTeamName() {
  return (
    quoteTeamInput?.value?.trim() ||
    mobileQuoteTeamInput?.value?.trim() ||
    ""
  );
}

const SHARE_PARAM_NAME = "s";
const SHARE_MOLD_CODES = [
  "classic-crew",
  "classic-v",
  "classic-polo",
  "ranglan-crew",
  "ranglan-v",
  "ranglan-polo"
];
const SHARE_DORSAL_FONT_CODES = ["lemands", "2017", "ariq", "broncos", "feyenoord", "jersey", "jl"];
const SHARE_BOOL_FIELDS = [
  () => panelHombrosEnabled,
  () => borderPanelHombrosEnabled,
  () => panelLateralesEnabled,
  () => borderPanelLateralesEnabled,
  () => lineCuelloEnabled,
  () => linePunosEnabled,
  () => lineFinaEnabled,
  () => lineGruesaEnabled,
  () => lineInferiorEnabled,
  () => starbadeLogoState.strokeEnabled,
  () => starbadeLogoState.backStrokeEnabled,
  () => dorsalNumberState.numberEnabled,
  () => dorsalNumberState.strokeEnabled,
  () => dorsalNumberState.nameEnabled,
  () => dorsalNumberState.nameStrokeEnabled,
  () => shortLogoState.numberEnabled
];
const SHARE_BOOL_SETTERS = [
  (value) => { panelHombrosEnabled = value; },
  (value) => { borderPanelHombrosEnabled = value; },
  (value) => { panelLateralesEnabled = value; },
  (value) => { borderPanelLateralesEnabled = value; },
  (value) => { lineCuelloEnabled = value; },
  (value) => { linePunosEnabled = value; },
  (value) => { lineFinaEnabled = value; },
  (value) => { lineGruesaEnabled = value; },
  (value) => { lineInferiorEnabled = value; },
  (value) => { starbadeLogoState.strokeEnabled = value; },
  (value) => { starbadeLogoState.backStrokeEnabled = value; },
  (value) => { dorsalNumberState.numberEnabled = value; },
  (value) => { dorsalNumberState.strokeEnabled = value; },
  (value) => { dorsalNumberState.nameEnabled = value; },
  (value) => { dorsalNumberState.nameStrokeEnabled = value; },
  (value) => { shortLogoState.numberEnabled = value; }
];
const SHARE_SPLIT_GROUP_KEYS = ["sleeves", "cuffs", "linePunos"];
const SHARE_COLOR_FIELDS = [
  ["a", () => kitDesignState.color, (value) => { kitDesignState.color = value; }, initialDesignRed, "design"],
  ["b", () => kitDesignState.secondaryColor, (value) => { kitDesignState.secondaryColor = value; }, initialDesignOrange, "designSecondary"],
  ["f", () => kitMaterialState.frontColor, (value) => { kitMaterialState.frontColor = value; }, initialRed, "front"],
  ["g", () => kitMaterialState.backColor, (value) => { kitMaterialState.backColor = value; }, initialRed, "back"],
  ["n", () => kitMaterialState.neckColor, (value) => { kitMaterialState.neckColor = value; }, initialWhite, "neck"],
  ["p", () => kitMaterialState.lapelColor, (value) => { kitMaterialState.lapelColor = value; }, initialWhite, "lapel"],
  ["s", () => kitMaterialState.shortColor, (value) => { kitMaterialState.shortColor = value; }, initialWhite, "short"],
  ["k", () => kitMaterialState.socksColor, (value) => { kitMaterialState.socksColor = value; }, initialRed, "medias"],
  ["h", () => kitPanelLayerState.shoulderColor, (value) => { kitPanelLayerState.shoulderColor = value; }, initialWhite, "panelHombros"],
  ["i", () => kitPanelLayerState.shoulderBorderColor, (value) => { kitPanelLayerState.shoulderBorderColor = value; }, initialBlack, "borderPanelHombros"],
  ["j", () => kitPanelLayerState.sideColor, (value) => { kitPanelLayerState.sideColor = value; }, initialWhite, "panelLaterales"],
  ["l", () => kitPanelLayerState.sideBorderColor, (value) => { kitPanelLayerState.sideBorderColor = value; }, initialBlack, "borderPanelLaterales"],
  ["x", () => kitPanelLayerState.neckLineColor, (value) => { kitPanelLayerState.neckLineColor = value; }, initialBlackMid, "lineCuello"],
  ["y", () => splitGroups.linePunos.combinedColor, (value) => { splitGroups.linePunos.combinedColor = value; }, initialBlackMid, "linePunos"],
  ["z", () => splitGroups.linePunos.leftColor, (value) => { splitGroups.linePunos.leftColor = value; }, initialWhite, "linePunosLeft"],
  ["w", () => splitGroups.linePunos.rightColor, (value) => { splitGroups.linePunos.rightColor = value; }, initialBlack, "linePunosRight"],
  ["u", () => kitPanelLayerState.shortFineLineColor, (value) => { kitPanelLayerState.shortFineLineColor = value; }, initialRed, "lineFina"],
  ["v", () => kitPanelLayerState.shortThickLineColor, (value) => { kitPanelLayerState.shortThickLineColor = value; }, initialRed, "lineGruesa"],
  ["t", () => kitPanelLayerState.shortBottomLineColor, (value) => { kitPanelLayerState.shortBottomLineColor = value; }, initialRed, "lineInferior"],
  ["c", () => starbadeLogoState.logoColor, (value) => { starbadeLogoState.logoColor = value; }, initialWhite, "starbadeLogo"],
  ["e", () => starbadeLogoState.strokeColor, (value) => { starbadeLogoState.strokeColor = value; }, initialBlack, "starbadeStroke"],
  ["q", () => starbadeLogoState.backLogoColor, (value) => { starbadeLogoState.backLogoColor = value; }, initialWhite, "backStarbadeLogo"],
  ["r", () => starbadeLogoState.backStrokeColor, (value) => { starbadeLogoState.backStrokeColor = value; }, initialBlack, "backStarbadeStroke"],
  ["A", () => dorsalNumberState.numberColor, (value) => { dorsalNumberState.numberColor = value; }, initialBlackMid, "dorsalNumber"],
  ["B", () => dorsalNumberState.strokeColor, (value) => { dorsalNumberState.strokeColor = value; }, initialWhiteMid, "dorsalNumberStroke"],
  ["C", () => dorsalNumberState.nameColor, (value) => { dorsalNumberState.nameColor = value; }, initialBlackMid, "dorsalName"],
  ["D", () => dorsalNumberState.nameStrokeColor, (value) => { dorsalNumberState.nameStrokeColor = value; }, initialWhiteMid, "dorsalNameStroke"],
  ["E", () => shortLogoState.numberColor, (value) => { shortLogoState.numberColor = value; }, initialRed, "shortNumber"],
  ["F", () => shortLogoState.starbadeLogoColor, (value) => { shortLogoState.starbadeLogoColor = value; }, initialRed, "shortStarbadeLogo"],
  ["G", () => splitGroups.sleeves.combinedColor, (value) => { splitGroups.sleeves.combinedColor = value; }, initialRed, "sleeves"],
  ["H", () => splitGroups.sleeves.leftColor, (value) => { splitGroups.sleeves.leftColor = value; }, initialWhite, "sleevesLeft"],
  ["I", () => splitGroups.sleeves.rightColor, (value) => { splitGroups.sleeves.rightColor = value; }, initialBlack, "sleevesRight"],
  ["J", () => splitGroups.cuffs.combinedColor, (value) => { splitGroups.cuffs.combinedColor = value; }, initialWhite, "cuffs"],
  ["K", () => splitGroups.cuffs.leftColor, (value) => { splitGroups.cuffs.leftColor = value; }, initialWhite, "cuffsLeft"],
  ["L", () => splitGroups.cuffs.rightColor, (value) => { splitGroups.cuffs.rightColor = value; }, initialBlack, "cuffsRight"]
];

function normalizeShareColor(color) {
  const hex = String(color || "").trim().replace(/^#/, "").toLowerCase();
  return /^[0-9a-f]{3}$/.test(hex)
    ? `#${hex.split("").map((char) => char + char).join("")}`
    : (/^[0-9a-f]{6}$/.test(hex) ? `#${hex}` : "");
}

function normalizeConfigurableModelColor(color) {
  const normalizedColor = normalizeShareColor(color);
  const legacyDisplayColorModelOverrides = {
    "#000000": initialBlack,
    "#111111": "#4d4d4d",
    "#262626": initialBlackMid,
    "#5a5a5a": "#838383",
    "#8c8c8c": "#a9a9a9",
    "#bfbfbf": "#cfcfcf",
    "#d9d9d9": initialWhiteMid,
    "#f2f2f2": "#f5f5f5"
  };

  if (!normalizedColor) return "";

  return legacyDisplayColorModelOverrides[normalizedColor] || normalizedColor;
}

function getShareColorPalette() {
  return [...new Set([
    ...palette,
    ...mediasPalette,
    initialRed,
    initialDesignRed,
    initialDesignOrange,
    initialWhite,
    "#1C1C1C",
    "#000000",
    "#111111"
  ].map(normalizeShareColor).filter(Boolean))];
}

function encodeShareColor(color) {
  const normalized = normalizeShareColor(color);
  const paletteIndex = getShareColorPalette().indexOf(normalized);

  if (paletteIndex >= 0) {
    return `_${paletteIndex.toString(36)}`;
  }

  const hex = normalized.replace("#", "");

  if (/^([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/.test(hex)) {
    return `${hex[0]}${hex[2]}${hex[4]}`;
  }

  return hex;
}

function decodeShareColor(value) {
  if (!value) return "";

  if (value.startsWith("_")) {
    const index = parseInt(value.slice(1), 36);
    return normalizeConfigurableModelColor(getShareColorPalette()[index]);
  }

  if (/^[0-9a-f]{3}$/i.test(value)) {
    return normalizeConfigurableModelColor(value);
  }

  if (/^[0-9a-f]{6}$/i.test(value)) {
    return normalizeConfigurableModelColor(value);
  }

  return "";
}

function getShareDesignCodes() {
  return [...new Set(
    Array.from(document.querySelectorAll(".traditional-designs-item"))
      .map((item) => item.dataset.design)
      .filter(Boolean)
  )];
}

function encodeShareMask(getters) {
  return getters.reduce((mask, getValue, index) => (
    getValue() ? mask + (1 << index) : mask
  ), 0).toString(36);
}

function decodeShareMask(value, setters) {
  const mask = parseInt(value || "0", 36);
  if (!Number.isFinite(mask)) return;

  setters.forEach((setValue, index) => {
    setValue(Boolean(mask & (1 << index)));
  });
}

function buildSharedDesignPayload() {
  const tokens = [];
  const moldIndex = SHARE_MOLD_CODES.indexOf(selectedMold);
  const designCodes = getShareDesignCodes();
  const designIndex = designCodes.indexOf(kitDesignState.selectedDesign);
  const fontIndex = SHARE_DORSAL_FONT_CODES.indexOf(selectedDorsalFont);
  const boolMask = encodeShareMask(SHARE_BOOL_FIELDS);
  const splitMask = SHARE_SPLIT_GROUP_KEYS.reduce((mask, groupKey, index) => (
    isSplitGroupActive(groupKey) ? mask + (1 << index) : mask
  ), 0).toString(36);

  if (moldIndex > 0) tokens.push(`m${moldIndex.toString(36)}`);
  if (designIndex > 0) tokens.push(`d${designIndex.toString(36)}`);
  if (fontIndex > 0) tokens.push(`0${fontIndex.toString(36)}`);
  if (selectedDorsalVariant !== "10") tokens.push("11");
  if (boolMask !== "0") tokens.push(`o${boolMask}`);
  if (splitMask !== "0") tokens.push(`O${splitMask}`);

  SHARE_COLOR_FIELDS.forEach(([key, getValue, , defaultColor]) => {
    const value = normalizeConfigurableModelColor(getValue());
    const defaultValue = normalizeConfigurableModelColor(defaultColor);

    if (value && value !== defaultValue) {
      tokens.push(`${key}${encodeShareColor(value)}`);
    }
  });

  return tokens.join(".");
}

function buildSharedDesignUrl() {
  const payload = buildSharedDesignPayload();
  const url = new URL(window.location.href);

  url.search = "";
  url.hash = "";

  if (payload) {
    url.searchParams.set(SHARE_PARAM_NAME, payload);
  }

  return url.toString();
}

function getVisualAssetFingerprint(asset) {
  if (!asset?.file) return "";

  return [
    asset.file.name || "",
    asset.file.size || 0,
    asset.file.lastModified || 0
  ].join(":");
}

function getUnsavedChangesFingerprint() {
  return JSON.stringify({
    design: buildSharedDesignPayload(),
    mold: selectedMold,
    assets: {
      shield: getVisualAssetFingerprint(visualAssetState.shield),
      sponsor: getVisualAssetFingerprint(visualAssetState.sponsor),
      backSponsor: getVisualAssetFingerprint(visualAssetState.backSponsor)
    },
    quote: {
      name: quoteNameInput?.value?.trim() || "",
      mobileName: mobileQuoteNameInput?.value?.trim() || "",
      team: quoteTeamInput?.value?.trim() || "",
      mobileTeam: mobileQuoteTeamInput?.value?.trim() || "",
      sizes: Array.from(quoteSizeState).sort()
    }
  });
}

function resetUnsavedChangesBaseline() {
  unsavedChangesBaseline = getUnsavedChangesFingerprint();
}

function hasUnsavedChanges() {
  return Boolean(unsavedChangesBaseline) && getUnsavedChangesFingerprint() !== unsavedChangesBaseline;
}

function handleBeforeUnload(event) {
  if (isBeforeUnloadTemporarilyAllowed || !hasUnsavedChanges()) return;

  event.preventDefault();
  event.returnValue = unsavedChangesMessage;

  return unsavedChangesMessage;
}

function allowBeforeUnloadTemporarily() {
  isBeforeUnloadTemporarilyAllowed = true;

  window.setTimeout(() => {
    isBeforeUnloadTemporarilyAllowed = false;
  }, 1800);
}

function setupUnsavedChangesWarning() {
  window.setTimeout(resetUnsavedChangesBaseline, 0);
  window.addEventListener("beforeunload", handleBeforeUnload);
}

function parseSharedDesignPayload(payload) {
  if (!payload) return null;

  const state = {
    colors: {}
  };
  const colorKeys = new Set(SHARE_COLOR_FIELDS.map(([key]) => key));
  const designCodes = getShareDesignCodes();

  payload.split(".").forEach((token) => {
    if (!token) return;

    const key = token[0];
    const value = token.slice(1);

    if (key === "m") {
      state.mold = SHARE_MOLD_CODES[parseInt(value, 36)] || "";
      return;
    }

    if (key === "d") {
      state.design = designCodes[parseInt(value, 36)] || "";
      return;
    }

    if (key === "0") {
      state.font = SHARE_DORSAL_FONT_CODES[parseInt(value, 36)] || "";
      return;
    }

    if (key === "1") {
      state.variant = value === "1" ? "1" : "10";
      return;
    }

    if (key === "o") {
      state.boolMask = value;
      return;
    }

    if (key === "O") {
      state.splitMask = value;
      return;
    }

    if (colorKeys.has(key)) {
      const color = decodeShareColor(value);
      if (color) state.colors[key] = color;
    }
  });

  return state;
}

function getSharedDesignStateFromUrl() {
  const payload = new URLSearchParams(window.location.search).get(SHARE_PARAM_NAME);
  return parseSharedDesignPayload(payload);
}

function getDefaultDesignImageUploadEndpoint() {
  const hostname = window.location.hostname.toLowerCase();

  return hostname === "starbade.com.uy" || hostname === "www.starbade.com.uy"
    ? DESIGN_IMAGE_SITE_UPLOAD_ENDPOINT
    : DESIGN_IMAGE_WORKER_UPLOAD_ENDPOINT;
}

function hasSharedDesignStateInUrl() {
  return new URLSearchParams(window.location.search).has(SHARE_PARAM_NAME);
}

function getQuoteAutosaveInputValue(desktopInput, mobileInput) {
  const activeInput = getActiveQuoteInput(desktopInput, mobileInput);

  return (
    activeInput?.value?.trim() ||
    desktopInput?.value?.trim() ||
    mobileInput?.value?.trim() ||
    ""
  );
}

function normalizeAutosaveText(value, maxLength = 80) {
  return String(value || "").trim().slice(0, maxLength);
}

function getAutosaveInputMaxLength(input, fallback = 80) {
  const maxLength = Number(input?.maxLength || 0);

  return Number.isFinite(maxLength) && maxLength > 0 ? maxLength : fallback;
}

function buildConfiguratorAutosaveSnapshot() {
  return {
    version: CONFIGURATOR_AUTOSAVE_VERSION,
    savedAt: Date.now(),
    design: buildSharedDesignPayload(),
    quote: {
      name: getQuoteAutosaveInputValue(quoteNameInput, mobileQuoteNameInput),
      team: getQuoteAutosaveInputValue(quoteTeamInput, mobileQuoteTeamInput),
      sizes: Array.from(quoteSizeState).sort()
    }
  };
}

function getConfiguratorAutosaveFingerprint(snapshot) {
  const quote = snapshot?.quote || {};

  return JSON.stringify({
    design: String(snapshot?.design || ""),
    quote: {
      name: normalizeAutosaveText(quote.name, 40),
      team: normalizeAutosaveText(quote.team, 40),
      sizes: Array.isArray(quote.sizes)
        ? quote.sizes.filter((size) => size === "adulto" || size === "nino").sort()
        : []
    }
  });
}

function getAutosaveQuoteValues(quote = {}) {
  return {
    name: normalizeAutosaveText(quote.name, 40),
    team: normalizeAutosaveText(quote.team, 40),
    sizes: Array.isArray(quote.sizes)
      ? quote.sizes.filter((size) => size === "adulto" || size === "nino").sort()
      : []
  };
}

function hasMeaningfulAutosaveQuote(quote = {}) {
  const quoteValues = getAutosaveQuoteValues(quote);

  return Boolean(
    quoteValues.name ||
    quoteValues.team ||
    quoteValues.sizes.length
  );
}

function hasMeaningfulAutosaveDesign(snapshot) {
  const designPayload = String(snapshot?.design || "");

  if (!designPayload) return false;
  if (getConfiguratorAutosaveFingerprint(snapshot) === configuratorAutosaveInitialFingerprint) return false;

  return Boolean(parseSharedDesignPayload(designPayload));
}

function isMeaningfulConfiguratorAutosaveSnapshot(snapshot) {
  if (!snapshot) return false;

  return (
    hasMeaningfulAutosaveDesign(snapshot) ||
    hasMeaningfulAutosaveQuote(snapshot.quote)
  );
}

function readConfiguratorAutosaveSnapshot() {
  try {
    const rawSnapshot = localStorage.getItem(CONFIGURATOR_AUTOSAVE_STORAGE_KEY);
    if (!rawSnapshot) return null;

    const snapshot = JSON.parse(rawSnapshot);
    const quote = snapshot?.quote || {};

    if (!snapshot || snapshot.version !== CONFIGURATOR_AUTOSAVE_VERSION) return null;

    return {
      version: CONFIGURATOR_AUTOSAVE_VERSION,
      savedAt: Number(snapshot.savedAt || 0),
      design: String(snapshot.design || ""),
      quote: {
        name: normalizeAutosaveText(quote.name, getAutosaveInputMaxLength(quoteNameInput, 40)),
        team: normalizeAutosaveText(quote.team, getAutosaveInputMaxLength(quoteTeamInput, 40)),
        sizes: Array.isArray(quote.sizes)
          ? quote.sizes.filter((size) => size === "adulto" || size === "nino")
          : []
      }
    };
  } catch (error) {
    return null;
  }
}

function removeConfiguratorAutosaveSnapshot() {
  try {
    localStorage.removeItem(CONFIGURATOR_AUTOSAVE_STORAGE_KEY);
    CONFIGURATOR_AUTOSAVE_LEGACY_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    // If storage is blocked, there is nothing else to clean up.
  }
}

function saveConfiguratorAutosaveSnapshot() {
  if (configuratorAutosaveSuppressed) return;

  const snapshot = buildConfiguratorAutosaveSnapshot();
  const fingerprint = getConfiguratorAutosaveFingerprint(snapshot);

  if (
    fingerprint === configuratorAutosaveInitialFingerprint ||
    !isMeaningfulConfiguratorAutosaveSnapshot(snapshot)
  ) {
    removeConfiguratorAutosaveSnapshot();
    return;
  }

  try {
    localStorage.setItem(CONFIGURATOR_AUTOSAVE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (error) {
    console.warn("No se pudo guardar el estado local del configurador.", error);
  }
}

function scheduleConfiguratorAutosave(delay = CONFIGURATOR_AUTOSAVE_DELAY) {
  if (configuratorAutosaveSuppressed) return;

  window.clearTimeout(configuratorAutosaveTimer);
  configuratorAutosaveTimer = window.setTimeout(saveConfiguratorAutosaveSnapshot, delay);
}

function applyQuoteAutosaveState(quote = {}) {
  const name = normalizeAutosaveText(quote.name, getAutosaveInputMaxLength(quoteNameInput, 40));
  const team = normalizeAutosaveText(quote.team, getAutosaveInputMaxLength(quoteTeamInput, 40));
  const sizes = Array.isArray(quote.sizes) ? quote.sizes : [];

  [quoteNameInput, mobileQuoteNameInput].forEach((input) => {
    if (!input) return;

    input.value = name;
    setQuoteInputError(input, false);
  });

  [quoteTeamInput, mobileQuoteTeamInput].forEach((input) => {
    if (!input) return;

    input.value = team;
    setQuoteInputError(input, false);
  });

  quoteSizeState.clear();
  sizes.forEach((size) => {
    if (size === "adulto" || size === "nino") {
      quoteSizeState.add(size);
    }
  });

  syncQuoteSizeButtons();
  setQuoteSizeError(false);
  updateQuoteContactLinks();
}

function isRestorableConfiguratorAutosaveSnapshot(snapshot) {
  if (!snapshot) return false;
  if (!isMeaningfulConfiguratorAutosaveSnapshot(snapshot)) return false;

  return getConfiguratorAutosaveFingerprint(snapshot) !== configuratorAutosaveInitialFingerprint;
}

function openAutosaveRecoveryPanel() {
  if (!autosaveRecoveryOverlay || !autosaveRecoveryPanel) return;

  if (performanceWarningPanel?.classList.contains("active")) {
    window.setTimeout(openAutosaveRecoveryPanel, 250);
    return;
  }

  autosaveRecoveryOverlay.classList.add("active");
  autosaveRecoveryPanel.classList.add("active");

  document.body.style.overflow = "hidden";
}

function closeAutosaveRecoveryPanelFn() {
  if (!autosaveRecoveryPanel?.classList.contains("active")) return;

  autosaveRecoveryPanel.classList.add("closing");
  autosaveRecoveryOverlay?.classList.remove("active");

  setTimeout(() => {
    autosaveRecoveryPanel.classList.remove("active");
    autosaveRecoveryPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function restoreConfiguratorAutosaveSnapshot(snapshot) {
  if (!snapshot) {
    closeAutosaveRecoveryPanelFn();
    return;
  }

  configuratorAutosaveSuppressed = true;

  const sharedState = parseSharedDesignPayload(snapshot.design);

  if (sharedState) {
    applySharedDesignState(sharedState);
  }

  applyQuoteAutosaveState(snapshot.quote);
  closeAutosaveRecoveryPanelFn();

  window.setTimeout(() => {
    configuratorAutosaveSuppressed = false;
    resetUnsavedChangesBaseline();
  }, 900);
}

function discardConfiguratorAutosaveSnapshot() {
  removeConfiguratorAutosaveSnapshot();
  closeAutosaveRecoveryPanelFn();
  configuratorAutosaveInitialFingerprint = getConfiguratorAutosaveFingerprint(
    buildConfiguratorAutosaveSnapshot()
  );
  resetUnsavedChangesBaseline();
}

function setupConfiguratorAutosave({ skipRecoveryPrompt = false } = {}) {
  configuratorAutosaveInitialFingerprint = getConfiguratorAutosaveFingerprint(
    buildConfiguratorAutosaveSnapshot()
  );

  const savedSnapshot = readConfiguratorAutosaveSnapshot();

  if (!skipRecoveryPrompt && isRestorableConfiguratorAutosaveSnapshot(savedSnapshot)) {
    window.setTimeout(openAutosaveRecoveryPanel, 350);
  } else if (savedSnapshot) {
    removeConfiguratorAutosaveSnapshot();
  }

  const scheduleFromEvent = (event) => {
    const target = event.target;

    if (
      target instanceof Element &&
      (target.closest("#autosaveRecoveryPanel") || target.id === "autosaveRecoveryOverlay")
    ) {
      return;
    }

    scheduleConfiguratorAutosave(
      target instanceof Element && target.closest(".mold-option-item")
        ? CONFIGURATOR_AUTOSAVE_MOLD_DELAY
        : CONFIGURATOR_AUTOSAVE_DELAY
    );
  };

  document.addEventListener("input", scheduleFromEvent, true);
  document.addEventListener("change", scheduleFromEvent, true);
  document.addEventListener("click", scheduleFromEvent, true);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      saveConfiguratorAutosaveSnapshot();
    }
  });
  window.addEventListener("pagehide", saveConfiguratorAutosaveSnapshot);
}

function syncSharedDesignUiState() {
  SHARE_COLOR_FIELDS.forEach(([, getValue, , , previewKey]) => {
    const target = colorTargets[previewKey];

    if (!target) return;

    if (target.previewMode === "border") {
      syncStrokePreview(previewKey, getValue());
      return;
    }

    setColorPreviewBackgrounds(target.previews, getValue());
  });

  Object.keys(splitGroups).forEach((groupKey) => {
    syncSplitGroupPreviews(groupKey);
  });

  syncPanelHombrosToggle();
  syncPanelLateralesToggle({ openWarning: false });
  syncLineCuelloToggle();
  syncLinePunosToggle();
  syncShortLinesToggle();
  syncStarbadeStrokeToggle();
  syncBackStarbadeStrokeToggle();
  syncDorsalNumberToggles();
  syncShortLogoToggles();
  syncMoldOptionItems();
  syncMoldDependentLabels();
  syncLapelAvailability();
  syncDesignColorControls();
  syncDesignSelectionItems();
  updateDorsalPreview();
}

function applySharedDesignStateToModel() {
  applyKitMaterialColor("front", kitMaterialState.frontColor, false);
  applyKitMaterialColor("back", kitMaterialState.backColor, false);
  applyKitMaterialColor("neck", kitMaterialState.neckColor, false);
  applyKitMaterialColor("polo", kitMaterialState.lapelColor, false);
  applyKitMaterialGroupsColor(["shortLeft", "shortRight"], kitMaterialState.shortColor, false);
  applyKitMaterialColor("socks", kitMaterialState.socksColor, false);
  applyDirtySplitGroupMaterialStates();
  applyKitDesignState();
  applyKitShoulderPanelState();
  applyKitShoulderPanelBorderState();
  applyKitSidePanelState();
  applyKitSidePanelBorderState();
  applyKitNeckLineState();
  applyKitCuffLineState();
  applyKitShortFineLineState();
  applyKitShortThickLineState();
  applyKitShortBottomLineState();
  applyKitStarbadeLogoState();
  applyKitStarbadeStrokeState();
  applyKitBackStarbadeLogoState();
  applyKitBackStarbadeStrokeState();
  applyKitShortStarbadeLogoState();
  applyBackDorsalNumberState();
  applyBackDorsalNumberStrokeState();
  applyShortDorsalNumberState();
  applyBackDorsalNameState();
  applyBackDorsalNameStrokeState();
  syncViewerWarningIcon();
  window.starbadeViewer3D?.render?.();
}

function applySharedDesignState(sharedState) {
  if (!sharedState) return;

  if (sharedState.design) {
    setSelectedDesign(sharedState.design, { openWarning: false });
  }

  if (sharedState.boolMask) {
    decodeShareMask(sharedState.boolMask, SHARE_BOOL_SETTERS);
  }

  if (sharedState.splitMask) {
    const splitMask = parseInt(sharedState.splitMask, 36);

    if (Number.isFinite(splitMask)) {
      SHARE_SPLIT_GROUP_KEYS.forEach((groupKey, index) => {
        const group = splitGroups[groupKey];
        const isSplit = Boolean(splitMask & (1 << index));

        group?.containers.forEach((container) => {
          container?.classList.toggle("is-split", isSplit);
        });
      });
    }
  }

  SHARE_COLOR_FIELDS.forEach(([key, , setValue]) => {
    const color = normalizeConfigurableModelColor(sharedState.colors[key]);
    if (color) setValue(color);
  });

  if (sharedState.font) {
    setSelectedDorsalFont(sharedState.font);
  }

  if (sharedState.variant) {
    setSelectedDorsalVariant(sharedState.variant);
  }

  syncSharedDesignUiState();

  let applyAttempts = 0;

  const applyWhenViewerReady = () => {
    const viewer = window.starbadeViewer3D;

    if (!viewer?.setMold) {
      applyAttempts += 1;

      if (applyAttempts > 80) {
        console.warn("No se pudo aplicar el link compartido porque el visor 3D no esta listo.");
        return;
      }

      window.setTimeout(applyWhenViewerReady, 120);
      return;
    }

    if (sharedState.mold && selectedMold !== sharedState.mold) {
      viewer.setMold(sharedState.mold).then(() => {
        applySharedDesignStateToModel();
        syncMoldOptionItems();
        syncMoldDependentLabels();
        syncLapelAvailability();
      }).catch((error) => {
        console.warn("No se pudo aplicar el molde del link compartido.", error);
        applySharedDesignStateToModel();
      });
      return;
    }

    applySharedDesignStateToModel();
  };

  applyWhenViewerReady();
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
}

let clipboardToastTimeout = null;

function showClipboardToast(message = "Link copiado") {
  let toast = document.getElementById("clipboardToast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "clipboardToast";
    toast.className = "clipboard-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("active");

  window.clearTimeout(clipboardToastTimeout);
  clipboardToastTimeout = window.setTimeout(() => {
    toast.classList.remove("active");
  }, 1300);
}

async function handleCopyDesignLink(event) {
  const button = event?.currentTarget;
  const label = button?.querySelector("span");
  const originalLabel = label?.textContent || "";

  try {
    if (button) button.disabled = true;
    if (label) label.textContent = "Copiando";

    await copyTextToClipboard(buildSharedDesignUrl());

    if (label) label.textContent = "Link copiado";
    showClipboardToast("Link copiado");
  } catch (error) {
    console.warn("No se pudo copiar el link del dise\u00f1o.", error);

    if (label) label.textContent = "No se pudo copiar";
  } finally {
    window.setTimeout(() => {
      if (label) label.textContent = originalLabel || "Copiar Link";
      if (button) button.disabled = false;
    }, 1400);
  }
}

async function handleQuoteImageDownload(event) {
  const triggerButton = event?.currentTarget || quoteImageBtn;
  if (!triggerButton) return;

  const viewer = window.starbadeViewer3D;

  if (!viewer?.captureDesignImage) {
    console.warn("El visor 3D todavia no esta listo para exportar la imagen.");
    return;
  }

  const triggerLabel = triggerButton.querySelector("span");
  const originalLabel = triggerLabel?.textContent || triggerButton.textContent;

  triggerButton.disabled = true;
  if (triggerLabel) {
    triggerLabel.textContent = "Descargando Imagen...";
  }
  viewer3dRoot?.classList.add("is-exporting-image");

  try {
    setKitCameraView("full");
    const imageBlob = await viewer.captureDesignImage({
      view: "full",
      teamName: getQuoteTeamName()
    });
    downloadBlob(imageBlob, getDesignImageFilename());
  } catch (error) {
    console.warn("No se pudo guardar la imagen del diseño.", error);
  } finally {
    viewer3dRoot?.classList.remove("is-exporting-image");
    triggerButton.disabled = false;
    if (triggerLabel) {
      triggerLabel.textContent = originalLabel;
    }
  }
}

quoteImageBtn?.addEventListener("click", openSaveDesignPanel);
mobileViewDownloadBtn?.addEventListener("click", openSaveDesignPanel);
quoteRequestBtn?.addEventListener("click", openQuoteRequestPanel);
mobileQuoteRequestBtn?.addEventListener("click", openQuoteRequestPanel);
quoteWhatsappBtn?.addEventListener("click", (event) => handleQuoteContactClick(event, "whatsapp"));
quoteEmailBtn?.addEventListener("click", (event) => handleQuoteContactClick(event, "email"));
saveDesignDownloadBtn?.addEventListener("click", handleQuoteImageDownload);
copyDesignLinkBtn?.addEventListener("click", handleCopyDesignLink);

function syncMoldOptionItems() {
  moldOptionItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.mold === selectedMold);
  });
}

function syncMoldDependentLabels() {
  const isRanglanMold = getCurrentMoldDesignFamily() === "ranglan";
  const panelText = isRanglanMold ? "Panel Mangas" : "Panel Hombros";
  const borderText = isRanglanMold ? "Bordes Mangas" : "Bordes Hombros";
  const panelAria = isRanglanMold
    ? "Activar o desactivar panel mangas"
    : "Activar o desactivar panel hombros";
  const borderAria = isRanglanMold
    ? "Activar o desactivar bordes mangas"
    : "Activar o desactivar bordes panel hombros";

  panelHombrosLabels.forEach((label) => {
    if (!label) return;

    label.textContent = panelText;
  });

  borderPanelHombrosLabels.forEach((label) => {
    if (!label) return;

    label.textContent = borderText;
  });

  [panelHombrosToggle, mobilePanelHombrosToggle].forEach((toggle) => {
    toggle?.setAttribute("aria-label", panelAria);
  });

  [borderPanelHombrosToggle, mobileBorderPanelHombrosToggle].forEach((toggle) => {
    toggle?.setAttribute("aria-label", borderAria);
  });
}

function isLapelAvailableForCurrentMold() {
  return isCurrentMoldPolo();
}

function syncLapelAvailability() {
  const isAvailable = isLapelAvailableForCurrentMold();

  colorTargets?.lapel?.buttons?.forEach((button) => {
    if (!button) return;

    button.disabled = false;
    button.setAttribute("aria-disabled", String(!isAvailable));
    button.classList.toggle("is-disabled", !isAvailable);
  });

  [lapelInfoBtn, mobileLapelInfoBtn].forEach((button) => {
    if (!button) return;

    button.classList.toggle("is-hidden", isAvailable);
    button.setAttribute("aria-hidden", String(isAvailable));
    button.tabIndex = isAvailable ? -1 : 0;
  });
}

function applyKitMaterialGroupsColor(groupKeys, color, renderAfter = true) {
  const viewer = window.starbadeViewer3D;

  if (!viewer) return false;

  let didApply = false;

  groupKeys.forEach((groupKey) => {
    const materials = viewer.materialGroups?.[groupKey];

    if (!materials?.length) return;

    materials.forEach((material) => {
      material.color.set(color);
      material.needsUpdate = true;
    });

    didApply = true;
  });

  if (didApply && renderAfter) {
    viewer.render();
  }

  return didApply;
}

function applyKitMaterialColor(groupKey, color, renderAfter = true) {
  return applyKitMaterialGroupsColor([groupKey], color, renderAfter);
}

function applyKitDesignState() {
  window.starbadeViewer3D?.setDesign?.(
    kitDesignState.selectedDesign,
    kitDesignState.color,
    kitDesignState.secondaryColor
  );
}

function applyKitShoulderPanelState() {
  window.starbadeViewer3D?.setShoulderPanel?.(
    panelHombrosEnabled ? getKitPanelTexturePath("shoulder") : "",
    kitPanelLayerState.shoulderColor
  );
}

function applyKitShoulderPanelBorderState() {
  window.starbadeViewer3D?.setShoulderPanelBorder?.(
    panelHombrosEnabled && borderPanelHombrosEnabled
      ? getKitPanelTexturePath("shoulderBorder")
      : "",
    kitPanelLayerState.shoulderBorderColor
  );
}

function applyKitSidePanelState() {
  window.starbadeViewer3D?.setSidePanel?.(
    panelLateralesEnabled ? getKitPanelTexturePath("side") : "",
    kitPanelLayerState.sideColor
  );
}

function applyKitSidePanelBorderState() {
  window.starbadeViewer3D?.setSidePanelBorder?.(
    panelLateralesEnabled && borderPanelLateralesEnabled
      ? getKitPanelTexturePath("sideBorder")
      : "",
    kitPanelLayerState.sideBorderColor
  );
}

function applyKitNeckLineState() {
  const neckLineTexturePath = isCurrentMoldPolo()
    ? getKitPanelTexturePath("neckLinePolo")
    : getKitPanelTexturePath("neckLine");

  window.starbadeViewer3D?.setNeckLine?.(
    lineCuelloEnabled ? neckLineTexturePath : "",
    kitPanelLayerState.neckLineColor
  );
}

function applyKitCuffLineState() {
  const group = splitGroups.linePunos;
  const isSplit = isSplitGroupActive("linePunos");
  const colors = isSplit
    ? {
      left: group.leftColor,
      right: group.rightColor
    }
    : {
      left: group.combinedColor,
      right: group.combinedColor
    };

  kitPanelLayerState.cuffLineColor = group.combinedColor;
  kitPanelLayerState.cuffLineLeftColor = group.leftColor;
  kitPanelLayerState.cuffLineRightColor = group.rightColor;

  window.starbadeViewer3D?.setCuffLine?.(
    linePunosEnabled ? getKitPanelTexturePath("cuffLine") : "",
    colors
  );
}

function applyKitShortFineLineState() {
  window.starbadeViewer3D?.setShortFineLine?.(
    lineFinaEnabled ? kitPanelTexturePaths.shortFineLine : "",
    kitPanelLayerState.shortFineLineColor
  );
}

function applyKitShortThickLineState() {
  window.starbadeViewer3D?.setShortThickLine?.(
    lineGruesaEnabled ? kitPanelTexturePaths.shortThickLine : "",
    kitPanelLayerState.shortThickLineColor
  );
}

function applyKitShortBottomLineState() {
  window.starbadeViewer3D?.setShortBottomLine?.(
    lineInferiorEnabled ? kitPanelTexturePaths.shortBottomLine : "",
    kitPanelLayerState.shortBottomLineColor
  );
}

function applyKitStarbadeLogoState() {
  window.starbadeViewer3D?.setStarbadeLogo?.(
    "front",
    starbadeLogoState.logoColor
  );
}

function applyKitStarbadeStrokeState() {
  window.starbadeViewer3D?.setStarbadeLogoStroke?.(
    "front",
    starbadeLogoState.strokeEnabled,
    starbadeLogoState.strokeColor
  );
}

function applyKitBackStarbadeLogoState() {
  window.starbadeViewer3D?.setStarbadeLogo?.(
    "back",
    starbadeLogoState.backLogoColor
  );
}

function applyKitBackStarbadeStrokeState() {
  window.starbadeViewer3D?.setStarbadeLogoStroke?.(
    "back",
    starbadeLogoState.backStrokeEnabled,
    starbadeLogoState.backStrokeColor
  );
}

function getCurrentSingleColorDesignRules() {
  return singleColorDesignRules[kitDesignState.selectedDesign] || null;
}

function getCurrentDesignRules() {
  return (
    getCurrentSingleColorDesignRules() ||
    twoColorDesignRules[kitDesignState.selectedDesign] ||
    null
  );
}

function isCurrentDesignSingleColor() {
  return Boolean(getCurrentSingleColorDesignRules());
}

function isNoDesignSelected() {
  return kitDesignState.selectedDesign === "sin-diseno";
}

function isCurrentDesignSleeveOnly() {
  return sleeveOnlyDesigns.has(kitDesignState.selectedDesign);
}

function doesCurrentDesignBlockSleeveDesignColorMatch() {
  return sleeveDesignColorConflictDesigns.has(kitDesignState.selectedDesign);
}

function canBackMatchCurrentDesignColor() {
  return backDesignColorFreeDesigns.has(kitDesignState.selectedDesign);
}

function getCurrentTwoColorDesignMaterialTargets() {
  return twoColorDesignMaterialTargets[kitDesignState.selectedDesign] || [];
}

function normalizeDesignMaterialTarget(materialKey) {
  if (materialKey === "front" || materialKey === "back") return materialKey;
  if (
    materialKey === "sleeves" ||
    materialKey === "sleevesLeft" ||
    materialKey === "sleevesRight"
  ) {
    return "sleeves";
  }

  return "";
}

function doesCurrentTwoColorDesignTargetMaterial(materialKey) {
  const target = normalizeDesignMaterialTarget(materialKey);

  return Boolean(target && getCurrentTwoColorDesignMaterialTargets().includes(target));
}

function getCurrentSleeveBlockedDesignColors() {
  if (!doesCurrentDesignBlockSleeveDesignColorMatch()) return [];

  const colors = [kitDesignState.color];

  if (twoColorDesigns.has(kitDesignState.selectedDesign)) {
    colors.push(kitDesignState.secondaryColor);
  }

  return colors.filter(Boolean);
}

function isFrontStarbadeStrokeAllowedForCurrentDesign() {
  return Boolean(getCurrentDesignRules()?.frontLogoStroke);
}

function isBackStarbadeStrokeAllowedForCurrentDesign() {
  return Boolean(getCurrentDesignRules()?.backLogoStroke);
}

function isDorsalStrokeAllowedForCurrentDesign() {
  return Boolean(getCurrentDesignRules()?.numberStroke);
}

function isDorsalNameStrokeAllowedForCurrentDesign() {
  return Boolean(getCurrentDesignRules()?.nameStroke);
}

function isRanglanSleevePanelBlockedForCurrentDesign() {
  return (
    getCurrentMoldDesignFamily() === "ranglan" &&
    ranglanSleevePanelBlockedDesigns.has(kitDesignState.selectedDesign)
  );
}

function disableStarbadeStrokesForCurrentDesign() {
  const shouldDisableFrontStroke = !isFrontStarbadeStrokeAllowedForCurrentDesign();
  const shouldDisableBackStroke = !isBackStarbadeStrokeAllowedForCurrentDesign();
  const hadEnabledFrontStroke = starbadeLogoState.strokeEnabled;
  const hadEnabledBackStroke = starbadeLogoState.backStrokeEnabled;

  if (shouldDisableFrontStroke) {
    starbadeLogoState.strokeEnabled = false;
  }

  if (shouldDisableBackStroke) {
    starbadeLogoState.backStrokeEnabled = false;
  }

  syncStarbadeStrokeToggle();
  syncBackStarbadeStrokeToggle();

  if (hadEnabledFrontStroke && shouldDisableFrontStroke) {
    applyKitStarbadeStrokeState();
  }

  if (hadEnabledBackStroke && shouldDisableBackStroke) {
    applyKitBackStarbadeStrokeState();
  }
}

function disableDorsalStrokesForCurrentDesign() {
  const shouldDisableNumberStroke = !isDorsalStrokeAllowedForCurrentDesign();
  const shouldDisableNameStroke = !isDorsalNameStrokeAllowedForCurrentDesign();

  if (!shouldDisableNumberStroke && !shouldDisableNameStroke) return;

  const hadEnabledNumberStroke = dorsalNumberState.strokeEnabled;
  const hadEnabledNameStroke = dorsalNumberState.nameStrokeEnabled;

  if (shouldDisableNumberStroke) {
    dorsalNumberState.strokeEnabled = false;
  }

  if (shouldDisableNameStroke) {
    dorsalNumberState.nameStrokeEnabled = false;
  }

  const hadEnabledStroke = hadEnabledNumberStroke || hadEnabledNameStroke;
  syncDorsalNumberToggles();

  if (!hadEnabledStroke) return;

  if (hadEnabledNumberStroke && shouldDisableNumberStroke) {
    applyBackDorsalNumberStrokeState();
  }

  if (hadEnabledNameStroke && shouldDisableNameStroke) {
    applyBackDorsalNameStrokeState();
  }
}

function disableRanglanSleevePanelsForCurrentDesign() {
  if (!isRanglanSleevePanelBlockedForCurrentDesign()) return;

  const hadEnabledPanel = panelHombrosEnabled;
  const hadEnabledBorder = borderPanelHombrosEnabled;

  panelHombrosEnabled = false;
  borderPanelHombrosEnabled = false;
  syncPanelHombrosToggle();

  if (!hadEnabledPanel && !hadEnabledBorder) return;

  applyKitShoulderPanelState();
  applyKitShoulderPanelBorderState();
}

function applyKitShortStarbadeLogoState() {
  window.starbadeViewer3D?.setStarbadeLogo?.(
    "shortLeft",
    shortLogoState.starbadeLogoColor
  );
}

function applyFrontShieldState() {
  window.starbadeViewer3D?.setFrontShield?.(
    visualAssetState.shield.previewUrl,
    shortLogoState.shieldEnabled
  );
}

function applyFrontSponsorState() {
  window.starbadeViewer3D?.setFrontSponsor?.(
    visualAssetState.sponsor.previewUrl
  );
}

function applyBackSponsorState() {
  window.starbadeViewer3D?.setBackSponsor?.(
    visualAssetState.backSponsor.previewUrl
  );
}

function applyBackDorsalNumberState() {
  const paths = getDorsalPreviewPaths();
  const numberSrc = dorsalNumberState.numberEnabled ? paths.number : "";

  window.starbadeViewer3D?.setBackDorsalNumber?.(
    numberSrc,
    dorsalNumberState.numberColor
  );
}

function applyBackDorsalNumberStrokeState() {
  const paths = getDorsalPreviewPaths();
  const numberStrokeSrc = (
    dorsalNumberState.numberEnabled &&
    dorsalNumberState.strokeEnabled &&
    isDorsalStrokeAllowedForCurrentDesign()
  )
    ? paths.numberStroke
    : "";

  window.starbadeViewer3D?.setBackDorsalNumberStroke?.(
    numberStrokeSrc,
    dorsalNumberState.strokeColor
  );
}

function applyShortDorsalNumberState() {
  const paths = getDorsalPreviewPaths();
  const numberSrc = shortLogoState.numberEnabled ? paths.number : "";

  window.starbadeViewer3D?.setShortDorsalNumber?.(
    numberSrc,
    shortLogoState.numberColor
  );
}

function applyBackDorsalNameState() {
  const paths = getDorsalPreviewPaths();
  const nameSrc = dorsalNumberState.nameEnabled ? paths.name : "";

  window.starbadeViewer3D?.setBackDorsalName?.(
    nameSrc,
    dorsalNumberState.nameColor
  );
}

function applyBackDorsalNameStrokeState() {
  const paths = getDorsalPreviewPaths();
  const nameStrokeSrc = (
    dorsalNumberState.nameEnabled &&
    dorsalNumberState.nameStrokeEnabled &&
    isDorsalNameStrokeAllowedForCurrentDesign()
  )
    ? paths.nameStroke
    : "";

  window.starbadeViewer3D?.setBackDorsalNameStroke?.(
    nameStrokeSrc,
    dorsalNumberState.nameStrokeColor
  );
}

async function initKitViewer3D() {
  if (!viewer3dRoot) return;

  try {
    const [THREE, { GLTFLoader }, { OrbitControls }, { RGBELoader }, { KTX2Loader }] = await Promise.all([
      import("three"),
      import("three/addons/loaders/GLTFLoader.js"),
      import("three/addons/controls/OrbitControls.js"),
      import("three/addons/loaders/RGBELoader.js"),
      import("three/addons/loaders/KTX2Loader.js")
    ]);

    const scene = new THREE.Scene();

    const viewerBackgroundCanvas = document.createElement("canvas");
    const viewerBackgroundSize = 1024;
    viewerBackgroundCanvas.width = viewerBackgroundSize;
    viewerBackgroundCanvas.height = viewerBackgroundSize;

    const viewerBackgroundContext = viewerBackgroundCanvas.getContext("2d");

    const addViewerBackgroundGlow = (x, y, radius, color) => {
      const gradient = viewerBackgroundContext.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      viewerBackgroundContext.fillStyle = gradient;
      viewerBackgroundContext.fillRect(0, 0, viewerBackgroundSize, viewerBackgroundSize);
    };

    const drawViewerBackground = (mode) => {
      const isLight = mode === "light";
      const baseBackgroundGradient = viewerBackgroundContext.createLinearGradient(
        0,
        0,
        viewerBackgroundSize,
        viewerBackgroundSize
      );

      if (isLight) {
        baseBackgroundGradient.addColorStop(0, "#adadad");
        baseBackgroundGradient.addColorStop(0.28, "#a3a3a3");
        baseBackgroundGradient.addColorStop(0.54, "#bbbbbb");
        baseBackgroundGradient.addColorStop(0.76, "#aaaaaa");
        baseBackgroundGradient.addColorStop(1, "#999999");
      } else {
        baseBackgroundGradient.addColorStop(0, "#343434");
        baseBackgroundGradient.addColorStop(0.28, "#252525");
        baseBackgroundGradient.addColorStop(0.54, "#3f3f3f");
        baseBackgroundGradient.addColorStop(0.76, "#303030");
        baseBackgroundGradient.addColorStop(1, "#1f1f1f");
      }

      viewerBackgroundContext.fillStyle = baseBackgroundGradient;
      viewerBackgroundContext.fillRect(0, 0, viewerBackgroundSize, viewerBackgroundSize);

      if (isLight) {
        addViewerBackgroundGlow(260, 190, 620, "rgba(255, 255, 255, 0.12)");
        addViewerBackgroundGlow(770, 320, 520, "rgba(255, 255, 255, 0.07)");
        addViewerBackgroundGlow(500, 860, 660, "rgba(0, 0, 0, 0.2)");
        addViewerBackgroundGlow(980, 920, 700, "rgba(0, 0, 0, 0.14)");
      } else {
        addViewerBackgroundGlow(260, 190, 620, "rgba(255, 255, 255, 0.065)");
        addViewerBackgroundGlow(770, 320, 520, "rgba(255, 255, 255, 0.04)");
        addViewerBackgroundGlow(500, 860, 660, "rgba(0, 0, 0, 0.37)");
        addViewerBackgroundGlow(980, 920, 700, "rgba(0, 0, 0, 0.28)");
      }
    };

    drawViewerBackground(document.body.classList.contains("theme-dark") ? "dark" : "light");

    const viewerBackgroundTexture = new THREE.CanvasTexture(viewerBackgroundCanvas);
    viewerBackgroundTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = viewerBackgroundTexture;

    const exportNeutralBackgroundCanvas = document.createElement("canvas");
    exportNeutralBackgroundCanvas.width = viewerBackgroundSize;
    exportNeutralBackgroundCanvas.height = viewerBackgroundSize;

    const exportNeutralBackgroundContext = exportNeutralBackgroundCanvas.getContext("2d");
    const exportNeutralBackgroundGradient = exportNeutralBackgroundContext.createLinearGradient(
      0,
      0,
      viewerBackgroundSize,
      viewerBackgroundSize
    );
    exportNeutralBackgroundGradient.addColorStop(0, "#969696");
    exportNeutralBackgroundGradient.addColorStop(0.25, "#777777");
    exportNeutralBackgroundGradient.addColorStop(0.52, "#8b8b8b");
    exportNeutralBackgroundGradient.addColorStop(0.76, "#7f7f7f");
    exportNeutralBackgroundGradient.addColorStop(1, "#686868");
    exportNeutralBackgroundContext.fillStyle = exportNeutralBackgroundGradient;
    exportNeutralBackgroundContext.fillRect(0, 0, viewerBackgroundSize, viewerBackgroundSize);

    const addExportNeutralGlow = (x, y, radius, color) => {
      const gradient = exportNeutralBackgroundContext.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, "rgba(128, 128, 128, 0)");
      exportNeutralBackgroundContext.fillStyle = gradient;
      exportNeutralBackgroundContext.fillRect(0, 0, viewerBackgroundSize, viewerBackgroundSize);
    };

    addExportNeutralGlow(260, 190, 620, "rgba(255, 255, 255, 0.22)");
    addExportNeutralGlow(770, 320, 520, "rgba(255, 255, 255, 0.14)");
    addExportNeutralGlow(500, 860, 660, "rgba(0, 0, 0, 0.24)");
    addExportNeutralGlow(980, 920, 700, "rgba(0, 0, 0, 0.18)");

    const exportNeutralBackgroundTexture = new THREE.CanvasTexture(exportNeutralBackgroundCanvas);
    exportNeutralBackgroundTexture.colorSpace = THREE.SRGBColorSpace;

    const exportBackgroundScene = new THREE.Scene();
    const exportBackgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const exportBackground = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshBasicMaterial({
        map: exportNeutralBackgroundTexture,
        depthWrite: false,
        depthTest: false
      })
    );
    exportBackgroundScene.add(exportBackground);

    const camera = new THREE.PerspectiveCamera(28, 1, 0.01, 100);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.6;

    viewer3dRoot.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath("https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/libs/basis/")
      .detectSupport(renderer);

    const environmentReady = new RGBELoader()
      .loadAsync("./hdri/Studio_Medium_Contrast.hdr")
      .then((texture) => {
        const environmentMap = pmremGenerator.fromEquirectangular(texture).texture;

        scene.environment = environmentMap;

        texture.dispose();
        pmremGenerator.dispose();
      })
      .catch((error) => {
        console.warn("No se pudo cargar el HDRI.", error);
        pmremGenerator.dispose();
      });

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.55;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x666666, 2.2));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(3.2, 4.5, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.9);
    fillLight.position.set(-4, 2.2, 3);
    scene.add(fillLight);

    const backLight = new THREE.DirectionalLight(0xffffff, 4);
    backLight.position.set(-1.8, 4.6, -5.4);
    scene.add(backLight);

    const groundShadowCanvas = document.createElement("canvas");
    const groundShadowCanvasSize = 512;
    groundShadowCanvas.width = groundShadowCanvasSize;
    groundShadowCanvas.height = groundShadowCanvasSize;

    const groundShadowContext = groundShadowCanvas.getContext("2d");
    const groundShadowGradient = groundShadowContext.createRadialGradient(
      groundShadowCanvasSize / 2,
      groundShadowCanvasSize / 2,
      groundShadowCanvasSize * 0.06,
      groundShadowCanvasSize / 2,
      groundShadowCanvasSize / 2,
      groundShadowCanvasSize * 0.48
    );
    groundShadowGradient.addColorStop(0, "rgba(0, 0, 0, 0.42)");
    groundShadowGradient.addColorStop(0.34, "rgba(0, 0, 0, 0.25)");
    groundShadowGradient.addColorStop(0.68, "rgba(0, 0, 0, 0.095)");
    groundShadowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    groundShadowContext.fillStyle = groundShadowGradient;
    groundShadowContext.fillRect(0, 0, groundShadowCanvasSize, groundShadowCanvasSize);

    const groundShadowTexture = new THREE.CanvasTexture(groundShadowCanvas);
    groundShadowTexture.colorSpace = THREE.NoColorSpace;
    groundShadowTexture.needsUpdate = true;

    const groundShadowMaterial = new THREE.MeshBasicMaterial({
      map: groundShadowTexture,
      transparent: true,
      opacity: 0.82,
      depthWrite: false,
      depthTest: true
    });

    const groundShadow = new THREE.Mesh(
      new THREE.PlaneGeometry(1, 1),
      groundShadowMaterial
    );
    groundShadow.name = "StarbadeGroundShadow";
    groundShadow.rotation.x = -Math.PI / 2;
    groundShadow.renderOrder = -1;
    scene.add(groundShadow);

    const materialGroups = {};
    const textureLoader = new THREE.TextureLoader();
    const designTextureCache = new Map();
    const designOverlayMaterials = [];
    const secondaryDesignOverlayMaterials = [];
    let designOverlayRoot = null;
    let secondaryDesignOverlayRoot = null;
    let designTextureRequestId = 0;
    const panelTextureCache = new Map();
    const shoulderPanelOverlayMaterials = [];
    const shoulderPanelBorderOverlayMaterials = [];
    const sidePanelOverlayMaterials = [];
    const sidePanelBorderOverlayMaterials = [];
    const neckLineOverlayMaterials = [];
    const cuffLineOverlayMaterials = [];
    const cuffLineLeftOverlayMaterials = [];
    const cuffLineRightOverlayMaterials = [];
    const shortFineLineOverlayMaterials = [];
    const shortThickLineOverlayMaterials = [];
    const shortBottomLineOverlayMaterials = [];
    let shoulderPanelRoot = null;
    let shoulderPanelBorderRoot = null;
    let sidePanelRoot = null;
    let sidePanelBorderRoot = null;
    let neckLineRoot = null;
    let cuffLineRoot = null;
    let shortFineLineRoot = null;
    let shortThickLineRoot = null;
    let shortBottomLineRoot = null;
    let shoulderPanelRequestId = 0;
    let shoulderPanelBorderRequestId = 0;
    let sidePanelRequestId = 0;
    let sidePanelBorderRequestId = 0;
    let neckLineRequestId = 0;
    let cuffLineRequestId = 0;
    let shortFineLineRequestId = 0;
    let shortThickLineRequestId = 0;
    let shortBottomLineRequestId = 0;
    const starbadeLogoCanvas = document.createElement("canvas");
    const starbadeLogoCanvasContext = starbadeLogoCanvas.getContext("2d");
    const starbadeLogoTexture = new THREE.CanvasTexture(starbadeLogoCanvas);
    const starbadeLogoOverlayMaterials = [];
    let starbadeLogoRoot = null;
    let starbadeLogoImage = null;
    let starbadeLogoImagePromise = null;
    const starbadeLogoStrokeCanvas = document.createElement("canvas");
    const starbadeLogoStrokeCanvasContext = starbadeLogoStrokeCanvas.getContext("2d");
    const starbadeLogoStrokeTexture = new THREE.CanvasTexture(starbadeLogoStrokeCanvas);
    const starbadeLogoStrokeOverlayMaterials = [];
    let starbadeLogoStrokeRoot = null;
    let starbadeLogoStrokeImage = null;
    let starbadeLogoStrokeImagePromise = null;
    const imageAlphaBoundsCache = new WeakMap();
    const frontShieldCanvas = document.createElement("canvas");
    const frontShieldCanvasContext = frontShieldCanvas.getContext("2d");
    const frontShieldTexture = new THREE.CanvasTexture(frontShieldCanvas);
    const frontShieldOverlayMaterials = [];
    let frontShieldRoot = null;
    let frontShieldRequestId = 0;
    let frontShieldImageSrc = "";
    let frontShieldImage = null;
    let frontSponsorRequestId = 0;
    let frontSponsorImageSrc = "";
    let frontSponsorImage = null;
    let backSponsorRequestId = 0;
    let backSponsorImageSrc = "";
    let backSponsorImage = null;
    const backDorsalCanvas = document.createElement("canvas");
    const backDorsalCanvasContext = backDorsalCanvas.getContext("2d");
    const backDorsalTexture = new THREE.CanvasTexture(backDorsalCanvas);
    const backDorsalOverlayMaterials = [];
    let backDorsalRoot = null;
    let backDorsalNumberRequestId = 0;
    let backDorsalNumberImageSrc = "";
    let backDorsalNumberImage = null;
    const backDorsalStrokeCanvas = document.createElement("canvas");
    const backDorsalStrokeCanvasContext = backDorsalStrokeCanvas.getContext("2d");
    const backDorsalStrokeTexture = new THREE.CanvasTexture(backDorsalStrokeCanvas);
    const backDorsalStrokeOverlayMaterials = [];
    let backDorsalStrokeRoot = null;
    let backDorsalNumberStrokeRequestId = 0;
    let backDorsalNumberStrokeImageSrc = "";
    let backDorsalNumberStrokeImage = null;
    const shortDorsalCanvas = document.createElement("canvas");
    const shortDorsalCanvasContext = shortDorsalCanvas.getContext("2d");
    const shortDorsalTexture = new THREE.CanvasTexture(shortDorsalCanvas);
    const shortDorsalOverlayMaterials = [];
    let shortDorsalRoot = null;
    let shortDorsalNumberRequestId = 0;
    let shortDorsalNumberImageSrc = "";
    let shortDorsalNumberImage = null;
    const backDorsalNameCanvas = document.createElement("canvas");
    const backDorsalNameCanvasContext = backDorsalNameCanvas.getContext("2d");
    const backDorsalNameTexture = new THREE.CanvasTexture(backDorsalNameCanvas);
    const backDorsalNameOverlayMaterials = [];
    let backDorsalNameRoot = null;
    let backDorsalNameRequestId = 0;
    let backDorsalNameImageSrc = "";
    let backDorsalNameImage = null;
    const backDorsalNameStrokeCanvas = document.createElement("canvas");
    const backDorsalNameStrokeCanvasContext = backDorsalNameStrokeCanvas.getContext("2d");
    const backDorsalNameStrokeTexture = new THREE.CanvasTexture(backDorsalNameStrokeCanvas);
    const backDorsalNameStrokeOverlayMaterials = [];
    let backDorsalNameStrokeRoot = null;
    let backDorsalNameStrokeRequestId = 0;
    let backDorsalNameStrokeImageSrc = "";
    let backDorsalNameStrokeImage = null;
    let modelRoot = null;
    let modelCenter = new THREE.Vector3();
    let modelSize = new THREE.Vector3(1, 1, 1);
    let modelRadius = 1;
    starbadeLogoCanvas.width = starbadeLogoUvCanvasSize;
    starbadeLogoCanvas.height = starbadeLogoUvCanvasSize;
    starbadeLogoTexture.colorSpace = THREE.NoColorSpace;
    starbadeLogoTexture.flipY = false;
    starbadeLogoTexture.wrapS = THREE.ClampToEdgeWrapping;
    starbadeLogoTexture.wrapT = THREE.ClampToEdgeWrapping;
    starbadeLogoTexture.generateMipmaps = true;
    starbadeLogoTexture.minFilter = THREE.LinearMipmapLinearFilter;
    starbadeLogoTexture.magFilter = THREE.LinearFilter;
    starbadeLogoTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    starbadeLogoTexture.needsUpdate = true;

    starbadeLogoStrokeCanvas.width = starbadeLogoUvCanvasSize;
    starbadeLogoStrokeCanvas.height = starbadeLogoUvCanvasSize;
    starbadeLogoStrokeTexture.colorSpace = THREE.NoColorSpace;
    starbadeLogoStrokeTexture.flipY = false;
    starbadeLogoStrokeTexture.wrapS = THREE.ClampToEdgeWrapping;
    starbadeLogoStrokeTexture.wrapT = THREE.ClampToEdgeWrapping;
    starbadeLogoStrokeTexture.generateMipmaps = true;
    starbadeLogoStrokeTexture.minFilter = THREE.LinearMipmapLinearFilter;
    starbadeLogoStrokeTexture.magFilter = THREE.LinearFilter;
    starbadeLogoStrokeTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    starbadeLogoStrokeTexture.needsUpdate = true;

    frontShieldCanvas.width = starbadeLogoUvCanvasSize;
    frontShieldCanvas.height = starbadeLogoUvCanvasSize;
    frontShieldTexture.colorSpace = THREE.SRGBColorSpace;
    frontShieldTexture.flipY = false;
    frontShieldTexture.wrapS = THREE.ClampToEdgeWrapping;
    frontShieldTexture.wrapT = THREE.ClampToEdgeWrapping;
    frontShieldTexture.generateMipmaps = true;
    frontShieldTexture.minFilter = THREE.LinearMipmapLinearFilter;
    frontShieldTexture.magFilter = THREE.LinearFilter;
    frontShieldTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    frontShieldTexture.needsUpdate = true;

    backDorsalCanvas.width = starbadeLogoUvCanvasSize;
    backDorsalCanvas.height = starbadeLogoUvCanvasSize;
    backDorsalTexture.colorSpace = THREE.NoColorSpace;
    backDorsalTexture.flipY = false;
    backDorsalTexture.wrapS = THREE.ClampToEdgeWrapping;
    backDorsalTexture.wrapT = THREE.ClampToEdgeWrapping;
    backDorsalTexture.generateMipmaps = true;
    backDorsalTexture.minFilter = THREE.LinearMipmapLinearFilter;
    backDorsalTexture.magFilter = THREE.LinearFilter;
    backDorsalTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    backDorsalTexture.needsUpdate = true;

    backDorsalStrokeCanvas.width = starbadeLogoUvCanvasSize;
    backDorsalStrokeCanvas.height = starbadeLogoUvCanvasSize;
    backDorsalStrokeTexture.colorSpace = THREE.NoColorSpace;
    backDorsalStrokeTexture.flipY = false;
    backDorsalStrokeTexture.wrapS = THREE.ClampToEdgeWrapping;
    backDorsalStrokeTexture.wrapT = THREE.ClampToEdgeWrapping;
    backDorsalStrokeTexture.generateMipmaps = true;
    backDorsalStrokeTexture.minFilter = THREE.LinearMipmapLinearFilter;
    backDorsalStrokeTexture.magFilter = THREE.LinearFilter;
    backDorsalStrokeTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    backDorsalStrokeTexture.needsUpdate = true;

    shortDorsalCanvas.width = starbadeLogoUvCanvasSize;
    shortDorsalCanvas.height = starbadeLogoUvCanvasSize;
    shortDorsalTexture.colorSpace = THREE.NoColorSpace;
    shortDorsalTexture.flipY = false;
    shortDorsalTexture.wrapS = THREE.ClampToEdgeWrapping;
    shortDorsalTexture.wrapT = THREE.ClampToEdgeWrapping;
    shortDorsalTexture.generateMipmaps = true;
    shortDorsalTexture.minFilter = THREE.LinearMipmapLinearFilter;
    shortDorsalTexture.magFilter = THREE.LinearFilter;
    shortDorsalTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    shortDorsalTexture.needsUpdate = true;

    backDorsalNameCanvas.width = starbadeLogoUvCanvasSize;
    backDorsalNameCanvas.height = starbadeLogoUvCanvasSize;
    backDorsalNameTexture.colorSpace = THREE.NoColorSpace;
    backDorsalNameTexture.flipY = false;
    backDorsalNameTexture.wrapS = THREE.ClampToEdgeWrapping;
    backDorsalNameTexture.wrapT = THREE.ClampToEdgeWrapping;
    backDorsalNameTexture.generateMipmaps = true;
    backDorsalNameTexture.minFilter = THREE.LinearMipmapLinearFilter;
    backDorsalNameTexture.magFilter = THREE.LinearFilter;
    backDorsalNameTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    backDorsalNameTexture.needsUpdate = true;

    backDorsalNameStrokeCanvas.width = starbadeLogoUvCanvasSize;
    backDorsalNameStrokeCanvas.height = starbadeLogoUvCanvasSize;
    backDorsalNameStrokeTexture.colorSpace = THREE.NoColorSpace;
    backDorsalNameStrokeTexture.flipY = false;
    backDorsalNameStrokeTexture.wrapS = THREE.ClampToEdgeWrapping;
    backDorsalNameStrokeTexture.wrapT = THREE.ClampToEdgeWrapping;
    backDorsalNameStrokeTexture.generateMipmaps = true;
    backDorsalNameStrokeTexture.minFilter = THREE.LinearMipmapLinearFilter;
    backDorsalNameStrokeTexture.magFilter = THREE.LinearFilter;
    backDorsalNameStrokeTexture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    backDorsalNameStrokeTexture.needsUpdate = true;

    const render = () => {
      renderer.render(scene, camera);
    };

    const captureDesignImage = async ({
      view = "full",
      width = 2048,
      height = 2048,
      teamName = ""
    } = {}) => new Promise(async (resolve, reject) => {
      if (!renderer.domElement) {
        reject(new Error("No hay canvas disponible para exportar."));
        return;
      }

      let exportLogoImage = null;

      try {
        exportLogoImage = await loadFirstAvailableImageElement([
          starbadeLogoTexturePath,
          "./textures/logos/starbade.png",
          "../textures/logos/starbade.png"
        ]);
      } catch (error) {
        console.warn("No se pudo cargar el logo para la imagen exportada.", error);
      }

      await Promise.all([
        environmentReady.catch(() => null),
        waitForDocumentFontsReady(),
        waitForAnimationFrames(2)
      ]);

      const previousSize = new THREE.Vector2();
      const previousPixelRatio = renderer.getPixelRatio();
      const previousAspect = camera.aspect;
      const previousPosition = camera.position.clone();
      const previousTarget = controls.target.clone();
      const previousScissorTest = renderer.getScissorTest();
      const previousAutoClear = renderer.autoClear;
      const previousSceneBackground = scene.background;
      const previousClearColor = new THREE.Color();
      const previousClearAlpha = renderer.getClearAlpha();
      const previousViewport = new THREE.Vector4();
      const previousScissor = new THREE.Vector4();
      const exportTeamName = String(teamName || "").trim();
      const shouldExportSideContinuityWarning = (
        !panelLateralesEnabled &&
        sideContinuityWarningDesigns.has(kitDesignState.selectedDesign)
      );
      const headerHeight = 152;
      const renderTop = 56;
      const renderDrawTop = renderTop - 36;
      const renderDrawHeight = height - renderDrawTop;
      const renderHeight = height - renderTop;
      const exportViewOffsetX = 20;
      const exportViewLayouts = {
        front: {
          x: 26 + exportViewOffsetX,
          width: Math.round(width * 0.27),
          rotationY: 0,
          scale: 0.94
        },
        back: {
          x: Math.round(width * 0.312) + exportViewOffsetX,
          width: Math.round(width * 0.27),
          rotationY: Math.PI,
          scale: 0.94
        },
        left: {
          x: Math.round(width * 0.562) + exportViewOffsetX,
          width: Math.round(width * 0.205),
          rotationY: -Math.PI / 2,
          scale: 0.94
        },
        right: {
          x: Math.round(width * 0.787) + exportViewOffsetX,
          width: Math.round(width * 0.205),
          rotationY: Math.PI / 2,
          scale: 0.94
        }
      };

      renderer.getViewport(previousViewport);
      renderer.getScissor(previousScissor);

      renderer.getSize(previousSize);
      renderer.setPixelRatio(1);
      renderer.setSize(width, renderHeight, false);
      renderer.setScissorTest(true);
      renderer.autoClear = false;
      renderer.getClearColor(previousClearColor);
      renderer.setClearColor(0x000000, 0);
      scene.background = null;

      const getExportRoots = () => ([
        modelRoot,
        designOverlayRoot,
        secondaryDesignOverlayRoot,
        shoulderPanelRoot,
        shoulderPanelBorderRoot,
        sidePanelRoot,
        sidePanelBorderRoot,
        neckLineRoot,
        cuffLineRoot,
        shortFineLineRoot,
        shortThickLineRoot,
        shortBottomLineRoot,
        starbadeLogoStrokeRoot,
        starbadeLogoRoot,
        frontShieldRoot,
        backDorsalRoot,
        backDorsalStrokeRoot,
        shortDorsalRoot,
        backDorsalNameRoot,
        backDorsalNameStrokeRoot
      ].filter(Boolean));

      const exportRoots = getExportRoots();
      const previousRootRotations = exportRoots.map((root) => root.rotation.clone());
      const previousRootPositions = exportRoots.map((root) => root.position.clone());
      const previousRootScales = exportRoots.map((root) => root.scale.clone());
      const previousGroundShadowScale = groundShadow?.scale.clone();
      const exportViewScaleAnchor = new THREE.Vector3(
        modelCenter.x,
        modelCenter.y - (modelSize.y / 2),
        modelCenter.z
      );

      const setExportRootsView = ({ rotationY = 0, scale = 1 } = {}) => {
        exportRoots.forEach((root, index) => {
          root.rotation.copy(previousRootRotations[index]);
          root.position.copy(previousRootPositions[index]);
          root.scale.copy(previousRootScales[index]);

          if (rotationY) {
            root.rotation.y += rotationY;
          }

          if (scale !== 1) {
            root.scale.multiplyScalar(scale);
            root.position.set(
              exportViewScaleAnchor.x + ((previousRootPositions[index].x - exportViewScaleAnchor.x) * scale),
              exportViewScaleAnchor.y + ((previousRootPositions[index].y - exportViewScaleAnchor.y) * scale),
              exportViewScaleAnchor.z + ((previousRootPositions[index].z - exportViewScaleAnchor.z) * scale)
            );
          }
        });
      };

      const renderExportView = (layout) => {
        const preset = kitCameraState.presets[view] || kitCameraState.presets.full || kitCameraState.presets.shirt;
        const viewportX = Math.max(0, layout.x);
        const viewportWidth = Math.min(layout.width, width - viewportX);

        camera.aspect = layout.width / renderHeight;
        camera.updateProjectionMatrix();

        if (preset) {
          camera.position.copy(preset.position);
          controls.target.copy(preset.target);
        } else {
          kitCameraState.applyView?.(view);
        }

        setExportRootsView(layout);

        camera.lookAt(controls.target);
        syncCameraClipping();
        controls.update();
        renderer.setViewport(layout.x, 0, layout.width, renderHeight);
        renderer.setScissor(viewportX, 0, viewportWidth, renderHeight);
        renderer.clearDepth();
        render();
      };

      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, width, renderHeight);
      renderer.clear(true, true, true);
      renderer.clearDepth();
      renderer.setScissorTest(true);
      if (groundShadow && previousGroundShadowScale) {
        groundShadow.scale.set(
          previousGroundShadowScale.x * 0.53125,
          previousGroundShadowScale.y * 0.53125,
          previousGroundShadowScale.z
        );
      }
      renderExportView(exportViewLayouts.front);
      renderExportView(exportViewLayouts.back);
      renderExportView(exportViewLayouts.left);
      renderExportView(exportViewLayouts.right);
      setExportRootsView();

      const finalizeExport = (blob) => {
        setExportRootsView();
        if (groundShadow && previousGroundShadowScale) {
          groundShadow.scale.copy(previousGroundShadowScale);
        }
        renderer.autoClear = previousAutoClear;
        scene.background = previousSceneBackground;
        renderer.setClearColor(previousClearColor, previousClearAlpha);
        renderer.setScissorTest(previousScissorTest);
        renderer.setViewport(previousViewport);
        renderer.setScissor(previousScissor);
        renderer.setPixelRatio(previousPixelRatio);
        renderer.setSize(previousSize.x, previousSize.y, false);
        camera.aspect = previousAspect;
        camera.position.copy(previousPosition);
        controls.target.copy(previousTarget);
        camera.updateProjectionMatrix();
        syncCameraClipping();
        controls.update();
        render();

        if (!blob) {
          reject(new Error("No se pudo crear la imagen del diseño."));
          return;
        }

        resolve(blob);
      };

      await waitForAnimationFrames(1);

      const renderBlob = await canvasToBlob(renderer.domElement, "image/png");

      {
        if (!renderBlob) {
          finalizeExport(null);
          return;
        }

        const renderImageUrl = URL.createObjectURL(renderBlob);
        const renderImage = new Image();

        renderImage.onload = async () => {
          try {
            await renderImage.decode?.();
          } catch (error) {
            // onload is enough for drawing; decode() may reject on some browsers.
          }

          try {
          const exportCanvas = document.createElement("canvas");
          exportCanvas.width = width;
          exportCanvas.height = height;

          const exportContext = exportCanvas.getContext("2d");
          exportContext.drawImage(exportNeutralBackgroundCanvas, 0, 0, width, height);
          exportContext.drawImage(renderImage, 0, renderDrawTop, width, renderDrawHeight);
          exportContext.fillStyle = "#1C1C1C";
          exportContext.fillRect(0, 0, width, headerHeight);

          const logoHeight = 72;
          const logoSourceWidth = exportLogoImage?.naturalWidth || exportLogoImage?.width || 0;
          const logoSourceHeight = exportLogoImage?.naturalHeight || exportLogoImage?.height || 0;

          if (exportLogoImage && logoSourceWidth && logoSourceHeight) {
            const logoWidth = logoSourceWidth * (logoHeight / logoSourceHeight);
            exportContext.drawImage(exportLogoImage, 58, (headerHeight - logoHeight) / 2, logoWidth, logoHeight);
          } else {
            exportContext.fillStyle = "#ffffff";
            exportContext.textAlign = "left";
            exportContext.textBaseline = "middle";
            exportContext.font = "700 56px Outfit, Arial, sans-serif";
            exportContext.fillText("starbade", 58, headerHeight / 2);
          }

          exportContext.fillStyle = "#ffffff";
          exportContext.textAlign = "right";
          exportContext.textBaseline = "middle";
          exportContext.font = "400 26px Outfit, Arial, sans-serif";
          exportContext.fillText("Diseñado con el", width - 58, (headerHeight / 2) - 18);
          exportContext.fillText("Configurador 3D de Starbade", width - 58, (headerHeight / 2) + 18);

          if (exportTeamName) {
            exportContext.fillStyle = "#ffffff";
            exportContext.textAlign = "center";
            exportContext.textBaseline = "middle";
            exportContext.font = "500 25px Outfit, Arial, sans-serif";
            exportContext.fillText("Equipo:", width / 2, (headerHeight / 2) - 18, width * 0.34);
            exportContext.font = "600 30px Outfit, Arial, sans-serif";
            exportContext.fillText(exportTeamName, width / 2, (headerHeight / 2) + 20, width * 0.38);
          }

          exportContext.fillStyle = "rgba(0, 0, 0, 0.42)";
          exportContext.textAlign = "center";
          exportContext.textBaseline = "bottom";
          exportContext.font = "400 30px Outfit, Arial, sans-serif";
          exportContext.fillText(
            "Imagen meramente ilustrativa. El producto final puede presentar diferencias leves propias del proceso de confecci\u00f3n y sublimado.",
            width / 2,
            height - 44,
            width - 96
          );

          if (shouldExportSideContinuityWarning) {
            exportContext.fillText(
              "Advertencia: sin paneles laterales, este diseño puede no coincidir exactamente en los costados de la prenda final.",
              width / 2,
              height - 10,
              width - 96
            );
          }

          URL.revokeObjectURL(renderImageUrl);

          const finalBlob = await canvasToBlob(exportCanvas, "image/png");
          finalizeExport(finalBlob);
          } catch (error) {
            URL.revokeObjectURL(renderImageUrl);
            console.warn("No se pudo componer la imagen final exportada.", error);
            finalizeExport(null);
          }
        };

        renderImage.onerror = () => {
          URL.revokeObjectURL(renderImageUrl);
          finalizeExport(null);
        };

        renderImage.src = renderImageUrl;
      }
    });

    const syncCameraClipping = () => {
      if (!modelRoot) return;

      const distance = camera.position.distanceTo(controls.target);

      camera.near = Math.max(modelRadius / 120, 3);
      camera.far = Math.max(distance + modelRadius * 2.2, camera.near + 1000);
      camera.updateProjectionMatrix();
    };

    const syncGroundShadow = () => {
      if (!modelRoot || !groundShadow) return;

      const shadowWidth = Math.max(modelSize.x * 1.62, modelRadius * 0.78, 368);
      const shadowDepth = Math.max(modelSize.z * 1.53, modelRadius * 0.51, 198);

      groundShadow.position.set(modelCenter.x, modelCenter.y - (modelSize.y / 2) - 0.8, modelCenter.z + modelSize.z * 0.08);
      groundShadow.scale.set(shadowWidth, shadowDepth, 1);
      groundShadow.visible = true;
    };

    const resize = () => {
      const { clientWidth, clientHeight } = viewer3dRoot;

      if (!clientWidth || !clientHeight) return;

      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight, false);

      if (modelRoot) {
        frameModel();
        return;
      }

      render();
    };

    const frameModel = () => {
      if (!modelRoot) return;

      const box = new THREE.Box3().setFromObject(modelRoot);
      const sphere = new THREE.Sphere();

      box.getCenter(modelCenter);
      box.getSize(modelSize);
      box.getBoundingSphere(sphere);

      modelRadius = sphere.radius || Math.max(modelSize.x, modelSize.y, modelSize.z) || 1;

      syncGroundShadow();

      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const fitHeightDistance = modelSize.y / (2 * Math.tan(verticalFov / 2));
      const fitWidthDistance = modelSize.x / (2 * Math.tan(horizontalFov / 2));
      const fullDistance = Math.max(fitHeightDistance, fitWidthDistance, modelRadius) * 1.22;

      controls.target.copy(modelCenter);
      controls.minDistance = fullDistance * 0.36;
      controls.maxDistance = fullDistance * 2.4;

      kitCameraState.presets = {
        shirt: {
          position: new THREE.Vector3(-0.65, 1359.36, 1648.50),
          target: new THREE.Vector3(-0.65, 1298.70, -18.67)
        },
        shirtShort: {
          position: new THREE.Vector3(-0.65, 1361.68, 2223.09),
          target: new THREE.Vector3(-0.65, 1172.27, -18.67)
        },
        full: {
          position: new THREE.Vector3(-0.65, 1303.12, 3823.74),
          target: new THREE.Vector3(-0.65, 827.37, -18.67)
        }
      };

      const applyPresetVerticalAngleLock = (preset) => {
        const offset = preset.position.clone().sub(preset.target);
        const polarAngle = new THREE.Spherical().setFromVector3(offset).phi;

        controls.minPolarAngle = polarAngle;
        controls.maxPolarAngle = polarAngle;
      };

      kitCameraState.applyView = (view) => {
        const preset = kitCameraState.presets[view] || kitCameraState.presets.shirt;

        applyPresetVerticalAngleLock(preset);
        camera.position.copy(preset.position);
        camera.lookAt(preset.target);
        controls.target.copy(preset.target);
        syncCameraClipping();
        controls.update();
        render();
      };

      kitCameraState.applyView(kitCameraState.view);
    };

    const registerMaterial = (material) => {
      if (!material?.name) return;

      const cleanName = material.name.toLowerCase();
      const groupMap = {
        frente: "front",
        espalda: "back",
        "manga derecha": "rightSleeve",
        "manga izquierda": "leftSleeve",
        "puno derecho": "rightCuff",
        "puno izquierdo": "leftCuff",
        cuello: "neck",
        "short derecho": "shortRight",
        "short izquierdo": "shortLeft",
        medias: "socks",
        polo: "polo"
      };

      Object.entries(groupMap).forEach(([prefix, key]) => {
        if (!cleanName.startsWith(prefix)) return;

        materialGroups[key] ||= [];
        materialGroups[key].push(material);
      });
    };

    const isDesignOverlayMaterial = (material) => {
      if (!material?.name) return false;

      const cleanName = material.name.toLowerCase();
      const designPrefixes = [
        "frente",
        "espalda",
        "manga derecha",
        "manga izquierda"
      ];

      return designPrefixes.some((prefix) => cleanName.startsWith(prefix));
    };

    const isGarmentMaterial = (material) => {
      if (!material?.name) return false;

      const cleanName = material.name.toLowerCase();
      const garmentPrefixes = [
        "frente",
        "espalda",
        "manga derecha",
        "manga izquierda",
        "puno derecho",
        "puno izquierdo",
        "cuello",
        "short derecho",
        "short izquierdo",
        "medias",
        "polo"
      ];

      return garmentPrefixes.some((prefix) => cleanName.startsWith(prefix));
    };

    const applyMaterialDepthBias = (material) => {
      if (!material?.name) return;

      const cleanName = material.name.toLowerCase();

      if (cleanName.startsWith("polo")) {
        material.polygonOffset = true;
        material.polygonOffsetFactor = -3;
        material.polygonOffsetUnits = -3;
        return;
      }

      if (!cleanName.startsWith("short ")) return;

      material.polygonOffset = true;
      material.polygonOffsetFactor = 0.75;
      material.polygonOffsetUnits = 0.75;
    };

    const configureDesignTexture = (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      texture.needsUpdate = true;
    };

    const getCompressedTexturePath = (texturePath) => (
      texturePath.replace(/\.(png|jpe?g|webp)$/i, ".ktx2")
    );

    const loadCompressedTextureWithFallback = async (texturePath) => {
      const compressedTexturePath = getCompressedTexturePath(texturePath);

      try {
        return await ktx2Loader.loadAsync(compressedTexturePath);
      } catch (error) {
        console.warn("No se pudo cargar la textura KTX2, se usa PNG.", compressedTexturePath, error);
        return textureLoader.loadAsync(texturePath);
      }
    };

    const loadDesignTexture = async (designId, layer = 1) => {
      const texturePath = getKitDesignTexturePath(designId, layer);

      if (!texturePath) return null;

      if (designTextureCache.has(texturePath)) {
        return designTextureCache.get(texturePath);
      }

      const texture = await loadCompressedTextureWithFallback(texturePath);

      configureDesignTexture(texture);
      designTextureCache.set(texturePath, texture);

      return texture;
    };

    const loadPanelTexture = async (texturePath) => {
      if (!texturePath) return null;

      if (panelTextureCache.has(texturePath)) {
        return panelTextureCache.get(texturePath);
      }

      const texture = await loadCompressedTextureWithFallback(texturePath);

      configureDesignTexture(texture);
      panelTextureCache.set(texturePath, texture);

      return texture;
    };

    const getStarbadeLogoPlacementKey = (material) => {
      if (!material?.name) return "";

      const cleanName = material.name.toLowerCase();

      if (cleanName.startsWith("frente")) return "front";
      if (cleanName.startsWith("espalda")) return "back";
      if (cleanName.startsWith("short izquierdo")) return "shortLeft";

      return "";
    };

    const loadStarbadeLogoImage = async () => {
      if (starbadeLogoImage) return starbadeLogoImage;

      if (!starbadeLogoImagePromise) {
        starbadeLogoImagePromise = textureLoader
          .loadAsync(starbadeLogoTexturePath)
          .then((texture) => {
            const image = texture.image;

            texture.dispose();
            starbadeLogoImage = image;

            return image;
          });
      }

      return starbadeLogoImagePromise;
    };

    const loadStarbadeLogoStrokeImage = async () => {
      if (starbadeLogoStrokeImage) return starbadeLogoStrokeImage;

      if (!starbadeLogoStrokeImagePromise) {
        starbadeLogoStrokeImagePromise = textureLoader
          .loadAsync(starbadeLogoStrokeTexturePath)
          .then((texture) => {
            const image = texture.image;

            texture.dispose();
            starbadeLogoStrokeImage = image;

            return image;
          });
      }

      return starbadeLogoStrokeImagePromise;
    };

    const getStarbadeLogoColor = (placementKey) => {
      if (placementKey === "back") return starbadeLogoState.backLogoColor;
      if (placementKey === "shortLeft") return shortLogoState.starbadeLogoColor;

      return starbadeLogoState.logoColor;
    };

    const getStarbadeLogoStrokeColor = (placementKey) => {
      if (placementKey === "back") return starbadeLogoState.backStrokeColor;

      return starbadeLogoState.strokeColor;
    };

    const isStarbadeLogoStrokeEnabled = (placementKey) => {
      if (placementKey === "back") return starbadeLogoState.backStrokeEnabled;

      return starbadeLogoState.strokeEnabled;
    };

    const hasEnabledStarbadeLogoStroke = () => (
      starbadeLogoState.strokeEnabled || starbadeLogoState.backStrokeEnabled
    );

    const loadImageElement = (src) => new Promise((resolve, reject) => {
      const image = new Image();

      image.decoding = "async";
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
    });

    const loadFrontShieldImage = async (imageSrc) => {
      if (frontShieldImage && frontShieldImageSrc === imageSrc) {
        return frontShieldImage;
      }

      const image = await loadImageElement(imageSrc);

      frontShieldImageSrc = imageSrc;
      frontShieldImage = image;

      return image;
    };

    const loadFrontSponsorImage = async (imageSrc) => {
      if (frontSponsorImage && frontSponsorImageSrc === imageSrc) {
        return frontSponsorImage;
      }

      const image = await loadImageElement(imageSrc);

      frontSponsorImageSrc = imageSrc;
      frontSponsorImage = image;

      return image;
    };

    const loadBackSponsorImage = async (imageSrc) => {
      if (backSponsorImage && backSponsorImageSrc === imageSrc) {
        return backSponsorImage;
      }

      const image = await loadImageElement(imageSrc);

      backSponsorImageSrc = imageSrc;
      backSponsorImage = image;

      return image;
    };

    const loadBackDorsalNumberImage = async (imageSrc) => {
      if (backDorsalNumberImage && backDorsalNumberImageSrc === imageSrc) {
        return backDorsalNumberImage;
      }

      const image = await loadImageElement(imageSrc);

      backDorsalNumberImageSrc = imageSrc;
      backDorsalNumberImage = image;

      return image;
    };

    const loadBackDorsalNumberStrokeImage = async (imageSrc) => {
      if (backDorsalNumberStrokeImage && backDorsalNumberStrokeImageSrc === imageSrc) {
        return backDorsalNumberStrokeImage;
      }

      const image = await loadImageElement(imageSrc);

      backDorsalNumberStrokeImageSrc = imageSrc;
      backDorsalNumberStrokeImage = image;

      return image;
    };

    const loadShortDorsalNumberImage = async (imageSrc) => {
      if (shortDorsalNumberImage && shortDorsalNumberImageSrc === imageSrc) {
        return shortDorsalNumberImage;
      }

      const image = await loadImageElement(imageSrc);

      shortDorsalNumberImageSrc = imageSrc;
      shortDorsalNumberImage = image;

      return image;
    };

    const loadBackDorsalNameImage = async (imageSrc) => {
      if (backDorsalNameImage && backDorsalNameImageSrc === imageSrc) {
        return backDorsalNameImage;
      }

      const image = await loadImageElement(imageSrc);

      backDorsalNameImageSrc = imageSrc;
      backDorsalNameImage = image;

      return image;
    };

    const loadBackDorsalNameStrokeImage = async (imageSrc) => {
      if (backDorsalNameStrokeImage && backDorsalNameStrokeImageSrc === imageSrc) {
        return backDorsalNameStrokeImage;
      }

      const image = await loadImageElement(imageSrc);

      backDorsalNameStrokeImageSrc = imageSrc;
      backDorsalNameStrokeImage = image;

      return image;
    };

    const redrawStarbadeLogoTexture = () => {
      if (!starbadeLogoCanvasContext || !starbadeLogoImage) return;

      starbadeLogoCanvasContext.clearRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      starbadeLogoCanvasContext.fillStyle = "#000000";
      starbadeLogoCanvasContext.fillRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      starbadeLogoCanvasContext.imageSmoothingEnabled = true;
      starbadeLogoCanvasContext.imageSmoothingQuality = "high";

      Object.keys(starbadeLogoPlacements).forEach((placementKey) => {
        const placement = getStarbadeLogoPlacement(placementKey);

        if (!placement) return;

        starbadeLogoCanvasContext.drawImage(
          starbadeLogoImage,
          placement.x,
          placement.y,
          placement.width,
          placement.height
        );
      });

      starbadeLogoTexture.needsUpdate = true;
    };

    const redrawStarbadeLogoStrokeTexture = () => {
      if (!starbadeLogoStrokeCanvasContext || !starbadeLogoStrokeImage) return;

      starbadeLogoStrokeCanvasContext.clearRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      starbadeLogoStrokeCanvasContext.fillStyle = "#000000";
      starbadeLogoStrokeCanvasContext.fillRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      starbadeLogoStrokeCanvasContext.imageSmoothingEnabled = true;
      starbadeLogoStrokeCanvasContext.imageSmoothingQuality = "high";

      Object.keys(starbadeLogoStrokePlacements).forEach((placementKey) => {
        const placement = getStarbadeLogoStrokePlacement(placementKey);

        if (!placement) return;

        starbadeLogoStrokeCanvasContext.drawImage(
          starbadeLogoStrokeImage,
          placement.x,
          placement.y,
          placement.width,
          placement.height
        );
      });

      starbadeLogoStrokeTexture.needsUpdate = true;
    };

    const createStarbadeLogoOverlayMaterial = (baseMaterial, placementKey) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(getStarbadeLogoColor(placementKey));
      material.map = null;
      material.alphaMap = starbadeLogoTexture;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.16;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = placementKey === "back" ? THREE.FrontSide : THREE.DoubleSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -2;
      material.polygonOffsetUnits = -2;

      starbadeLogoOverlayMaterials.push({
        placementKey,
        material
      });

      return material;
    };

    const createStarbadeLogoStrokeOverlayMaterial = (baseMaterial, placementKey) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(getStarbadeLogoStrokeColor(placementKey));
      material.map = null;
      material.alphaMap = starbadeLogoStrokeTexture;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.16;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = placementKey === "back" ? THREE.FrontSide : THREE.DoubleSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -1.9;
      material.polygonOffsetUnits = -1.9;
      material.visible = isStarbadeLogoStrokeEnabled(placementKey);

      starbadeLogoStrokeOverlayMaterials.push({
        placementKey,
        material
      });

      return material;
    };

    const getImageAlphaBounds = (image) => {
      if (imageAlphaBoundsCache.has(image)) {
        return imageAlphaBoundsCache.get(image);
      }

      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;

      if (!sourceWidth || !sourceHeight) return null;

      const boundsCanvas = document.createElement("canvas");
      const boundsContext = boundsCanvas.getContext("2d", { willReadFrequently: true });

      if (!boundsContext) return null;

      boundsCanvas.width = sourceWidth;
      boundsCanvas.height = sourceHeight;
      boundsContext.drawImage(image, 0, 0);

      let imageData;

      try {
        imageData = boundsContext.getImageData(0, 0, sourceWidth, sourceHeight).data;
      } catch (error) {
        return null;
      }

      let minX = sourceWidth;
      let minY = sourceHeight;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < sourceHeight; y += 1) {
        for (let x = 0; x < sourceWidth; x += 1) {
          const alpha = imageData[((y * sourceWidth + x) * 4) + 3];

          if (alpha <= 8) continue;

          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      const bounds = maxX >= 0
        ? {
          x: minX,
          y: minY,
          width: maxX - minX + 1,
          height: maxY - minY + 1
        }
        : null;

      imageAlphaBoundsCache.set(image, bounds);

      return bounds;
    };

    const drawContainedImage = (context, image, box, alignment = {}) => {
      const sourceWidth = image.naturalWidth || image.width;
      const sourceHeight = image.naturalHeight || image.height;

      if (!sourceWidth || !sourceHeight) return;

      const scale = Math.min(
        box.width / sourceWidth,
        box.height / sourceHeight
      );
      const drawWidth = sourceWidth * scale;
      const drawHeight = sourceHeight * scale;
      const alphaBounds = alignment.visibleContent ? getImageAlphaBounds(image) : null;
      const drawX = alphaBounds
        ? box.x + (box.width - (alphaBounds.width * scale)) / 2 - (alphaBounds.x * scale)
        : box.x + (box.width - drawWidth) / 2;
      const drawY = alphaBounds && alignment.vertical === "top"
        ? box.y - (alphaBounds.y * scale)
        : alphaBounds && alignment.vertical === "bottom"
          ? box.y + box.height - ((alphaBounds.y + alphaBounds.height) * scale)
          : alphaBounds
            ? box.y + (box.height - (alphaBounds.height * scale)) / 2 - (alphaBounds.y * scale)
            : alignment.vertical === "top"
              ? box.y
              : alignment.vertical === "bottom"
                ? box.y + box.height - drawHeight
                : box.y + (box.height - drawHeight) / 2;

      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    };

    const shouldCenterFrontSponsor = () => (
      kitDesignState.selectedDesign === "franja-horizontal"
      || kitDesignState.selectedDesign === "franja-horizontal-dos-colores"
      || kitDesignState.selectedDesign === "hoops"
      || kitDesignState.selectedDesign === "hoops2"
    );

    const redrawFrontAssetTexture = (showShortShield = false) => {
      if (!frontShieldCanvasContext) return;

      frontShieldCanvasContext.clearRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      frontShieldCanvasContext.imageSmoothingEnabled = true;
      frontShieldCanvasContext.imageSmoothingQuality = "high";

      if (frontShieldImage) {
        drawContainedImage(frontShieldCanvasContext, frontShieldImage, getFrontShieldPlacement());

        if (showShortShield) {
          drawContainedImage(frontShieldCanvasContext, frontShieldImage, shortShieldPlacement);
        }
      }

      if (frontSponsorImage) {
        drawContainedImage(
          frontShieldCanvasContext,
          frontSponsorImage,
          getFrontSponsorPlacement(),
          shouldCenterFrontSponsor()
            ? { visibleContent: true }
            : { vertical: "top", visibleContent: true }
        );
      }

      if (backSponsorImage) {
        drawContainedImage(
          frontShieldCanvasContext,
          backSponsorImage,
          getBackSponsorPlacement(),
          { vertical: "top", visibleContent: true }
        );
      }

      frontShieldTexture.needsUpdate = true;
    };

    const redrawBackDorsalTexture = () => {
      if (!backDorsalCanvasContext) return;

      backDorsalCanvasContext.clearRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      backDorsalCanvasContext.fillStyle = "#000000";
      backDorsalCanvasContext.fillRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      backDorsalCanvasContext.imageSmoothingEnabled = true;
      backDorsalCanvasContext.imageSmoothingQuality = "high";

      if (backDorsalNumberImage) {
        drawContainedImage(
          backDorsalCanvasContext,
          backDorsalNumberImage,
          getBackDorsalNumberPlacement(),
          { vertical: "top", visibleContent: true }
        );
      }

      backDorsalTexture.needsUpdate = true;
    };

    const redrawBackDorsalStrokeTexture = () => {
      if (!backDorsalStrokeCanvasContext) return;

      backDorsalStrokeCanvasContext.clearRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      backDorsalStrokeCanvasContext.fillStyle = "#000000";
      backDorsalStrokeCanvasContext.fillRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      backDorsalStrokeCanvasContext.imageSmoothingEnabled = true;
      backDorsalStrokeCanvasContext.imageSmoothingQuality = "high";

      if (backDorsalNumberStrokeImage) {
        drawContainedImage(
          backDorsalStrokeCanvasContext,
          backDorsalNumberStrokeImage,
          getBackDorsalNumberStrokePlacement(),
          { vertical: "top", visibleContent: true }
        );
      }

      backDorsalStrokeTexture.needsUpdate = true;
    };

    const redrawShortDorsalTexture = () => {
      if (!shortDorsalCanvasContext) return;

      shortDorsalCanvasContext.clearRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      shortDorsalCanvasContext.fillStyle = "#000000";
      shortDorsalCanvasContext.fillRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      shortDorsalCanvasContext.imageSmoothingEnabled = true;
      shortDorsalCanvasContext.imageSmoothingQuality = "high";

      if (shortDorsalNumberImage) {
        drawContainedImage(
          shortDorsalCanvasContext,
          shortDorsalNumberImage,
          shortDorsalNumberPlacement
        );
      }

      shortDorsalTexture.needsUpdate = true;
    };

    const redrawBackDorsalNameTexture = () => {
      if (!backDorsalNameCanvasContext) return;

      backDorsalNameCanvasContext.clearRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      backDorsalNameCanvasContext.fillStyle = "#000000";
      backDorsalNameCanvasContext.fillRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      backDorsalNameCanvasContext.imageSmoothingEnabled = true;
      backDorsalNameCanvasContext.imageSmoothingQuality = "high";

      if (backDorsalNameImage) {
        drawContainedImage(
          backDorsalNameCanvasContext,
          backDorsalNameImage,
          getBackDorsalNamePlacement(),
          { vertical: "bottom", visibleContent: true }
        );
      }

      backDorsalNameTexture.needsUpdate = true;
    };

    const redrawBackDorsalNameStrokeTexture = () => {
      if (!backDorsalNameStrokeCanvasContext) return;

      backDorsalNameStrokeCanvasContext.clearRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      backDorsalNameStrokeCanvasContext.fillStyle = "#000000";
      backDorsalNameStrokeCanvasContext.fillRect(
        0,
        0,
        starbadeLogoUvCanvasSize,
        starbadeLogoUvCanvasSize
      );
      backDorsalNameStrokeCanvasContext.imageSmoothingEnabled = true;
      backDorsalNameStrokeCanvasContext.imageSmoothingQuality = "high";

      if (backDorsalNameStrokeImage) {
        drawContainedImage(
          backDorsalNameStrokeCanvasContext,
          backDorsalNameStrokeImage,
          getBackDorsalNameStrokePlacement(),
          { vertical: "bottom", visibleContent: true }
        );
      }

      backDorsalNameStrokeTexture.needsUpdate = true;
    };

    const createFrontShieldOverlayMaterial = (baseMaterial) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set("#ffffff");
      material.map = frontShieldTexture;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.02;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = THREE.DoubleSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -4;
      material.polygonOffsetUnits = -4;
      material.needsUpdate = true;

      frontShieldOverlayMaterials.push(material);

      return material;
    };

    const createBackDorsalOverlayMaterial = (baseMaterial) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(dorsalNumberState.numberColor);
      material.map = null;
      material.alphaMap = backDorsalTexture;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.08;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = THREE.FrontSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -5;
      material.polygonOffsetUnits = -5;
      material.needsUpdate = true;

      backDorsalOverlayMaterials.push(material);

      return material;
    };

    const createBackDorsalStrokeOverlayMaterial = (baseMaterial) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(dorsalNumberState.strokeColor);
      material.map = null;
      material.alphaMap = backDorsalStrokeTexture;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.08;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = THREE.FrontSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -4.8;
      material.polygonOffsetUnits = -4.8;
      material.needsUpdate = true;

      backDorsalStrokeOverlayMaterials.push(material);

      return material;
    };

    const createShortDorsalOverlayMaterial = (baseMaterial) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(shortLogoState.numberColor);
      material.map = null;
      material.alphaMap = shortDorsalTexture;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.08;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = THREE.DoubleSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -5.5;
      material.polygonOffsetUnits = -5.5;
      material.needsUpdate = true;

      shortDorsalOverlayMaterials.push(material);

      return material;
    };

    const createBackDorsalNameOverlayMaterial = (baseMaterial) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(dorsalNumberState.nameColor);
      material.map = null;
      material.alphaMap = backDorsalNameTexture;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.08;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = THREE.FrontSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -5.5;
      material.polygonOffsetUnits = -5.5;
      material.needsUpdate = true;

      backDorsalNameOverlayMaterials.push(material);

      return material;
    };

    const createBackDorsalNameStrokeOverlayMaterial = (baseMaterial) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(dorsalNumberState.nameStrokeColor);
      material.map = null;
      material.alphaMap = backDorsalNameStrokeTexture;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.08;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = THREE.FrontSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -5.3;
      material.polygonOffsetUnits = -5.3;
      material.needsUpdate = true;

      backDorsalNameStrokeOverlayMaterials.push(material);

      return material;
    };

    const createPanelLayerOverlayMaterial = (
      baseMaterial,
      color,
      materialList,
      depthBias,
      side = THREE.DoubleSide
    ) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(color);
      material.map = null;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.02;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = side;
      material.polygonOffset = true;
      material.polygonOffsetFactor = depthBias;
      material.polygonOffsetUnits = depthBias;
      material.needsUpdate = true;

      materialList.push(material);

      return material;
    };

    const createDesignOverlayMaterial = (baseMaterial) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(kitDesignState.color);
      material.map = null;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.02;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = THREE.FrontSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -1;
      material.polygonOffsetUnits = -1;

      designOverlayMaterials.push(material);

      return material;
    };

    const createSecondaryDesignOverlayMaterial = (baseMaterial) => {
      const material = baseMaterial?.clone?.() || new THREE.MeshStandardMaterial();

      material.color.set(kitDesignState.secondaryColor);
      material.map = null;
      material.transparent = true;
      material.opacity = 1;
      material.alphaTest = 0.02;
      material.depthTest = true;
      material.depthWrite = false;
      material.side = THREE.FrontSide;
      material.polygonOffset = true;
      material.polygonOffsetFactor = -1.1;
      material.polygonOffsetUnits = -1.1;

      secondaryDesignOverlayMaterials.push(material);

      return material;
    };

    const emptyDesignOverlayMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: true,
      colorWrite: false,
      side: THREE.DoubleSide
    });

    const createDesignOverlayRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "StarbadeDesignOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => (
          isDesignOverlayMaterial(material)
            ? createDesignOverlayMaterial(material)
            : emptyDesignOverlayMaterial
        ));
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 20;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      designOverlayRoot = overlayRoot;
      scene.add(designOverlayRoot);
    };

    const createSecondaryDesignOverlayRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "StarbadeSecondaryDesignOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => (
          isDesignOverlayMaterial(material)
            ? createSecondaryDesignOverlayMaterial(material)
            : emptyDesignOverlayMaterial
        ));
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 21;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      secondaryDesignOverlayRoot = overlayRoot;
      scene.add(secondaryDesignOverlayRoot);
    };

    const createFrontBackTextureOverlayRoot = ({
      name,
      materialList,
      color,
      depthBias,
      renderOrder
    }) => {
      if (!modelRoot) return null;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = name;
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const cleanName = material?.name?.toLowerCase?.() || "";
          const isTarget = (
            cleanName.startsWith("frente") ||
            cleanName.startsWith("espalda")
          );

          return isTarget
            ? createPanelLayerOverlayMaterial(material, color, materialList, depthBias)
            : emptyDesignOverlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = renderOrder;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      scene.add(overlayRoot);

      return overlayRoot;
    };

    const createShoulderPanelRoot = () => {
      shoulderPanelRoot = createMaterialPrefixTextureOverlayRoot({
        name: "ShoulderPanelOverlay",
        materialList: shoulderPanelOverlayMaterials,
        color: kitPanelLayerState.shoulderColor,
        depthBias: -1.5,
        renderOrder: 21,
        side: THREE.FrontSide,
        targetPrefixes: getCurrentMoldDesignFamily() === "ranglan"
          ? ["manga derecha", "manga izquierda"]
          : ["frente", "espalda"]
      });
    };

    const createShoulderPanelBorderRoot = () => {
      shoulderPanelBorderRoot = createMaterialPrefixTextureOverlayRoot({
        name: "ShoulderPanelBorderOverlay",
        materialList: shoulderPanelBorderOverlayMaterials,
        color: kitPanelLayerState.shoulderBorderColor,
        depthBias: -1.75,
        renderOrder: 22,
        side: THREE.FrontSide,
        targetPrefixes: getCurrentMoldDesignFamily() === "ranglan"
          ? ["manga derecha", "manga izquierda"]
          : ["frente", "espalda"]
      });
    };

    const createSidePanelRoot = () => {
      sidePanelRoot = createFrontBackTextureOverlayRoot({
        name: "SidePanelOverlay",
        materialList: sidePanelOverlayMaterials,
        color: kitPanelLayerState.sideColor,
        depthBias: -1.6,
        renderOrder: 23
      });
    };

    const createSidePanelBorderRoot = () => {
      sidePanelBorderRoot = createFrontBackTextureOverlayRoot({
        name: "SidePanelBorderOverlay",
        materialList: sidePanelBorderOverlayMaterials,
        color: kitPanelLayerState.sideBorderColor,
        depthBias: -1.85,
        renderOrder: 24
      });
    };

    const createMaterialPrefixTextureOverlayRoot = ({
      name,
      materialList,
      color,
      depthBias,
      renderOrder,
      targetPrefixes,
      onTargetMaterial,
      side = THREE.DoubleSide
    }) => {
      if (!modelRoot) return null;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = name;
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const cleanName = material?.name?.toLowerCase?.() || "";
          const isTarget = targetPrefixes.some((prefix) => cleanName.startsWith(prefix));

          if (!isTarget) return emptyDesignOverlayMaterial;

          const overlayMaterial = createPanelLayerOverlayMaterial(
            material,
            color,
            materialList,
            depthBias,
            side
          );

          onTargetMaterial?.(overlayMaterial, cleanName);

          return overlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = renderOrder;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      scene.add(overlayRoot);

      return overlayRoot;
    };

    const createNeckLineRoot = () => {
      const targetPrefixes = isCurrentMoldPolo()
        ? ["polo"]
        : ["cuello"];

      neckLineRoot = createMaterialPrefixTextureOverlayRoot({
        name: "NeckLineOverlay",
        materialList: neckLineOverlayMaterials,
        color: kitPanelLayerState.neckLineColor,
        depthBias: isCurrentMoldPolo() ? -4 : -2,
        renderOrder: 25,
        targetPrefixes
      });
    };

    const createCuffLineRoot = () => {
      cuffLineRoot = createMaterialPrefixTextureOverlayRoot({
        name: "CuffLineOverlay",
        materialList: cuffLineOverlayMaterials,
        color: kitPanelLayerState.cuffLineColor,
        depthBias: -2,
        renderOrder: 25,
        targetPrefixes: ["puno derecho", "puno izquierdo"],
        onTargetMaterial(material, cleanName) {
          if (cleanName.startsWith("puno izquierdo")) {
            cuffLineLeftOverlayMaterials.push(material);
            return;
          }

          if (cleanName.startsWith("puno derecho")) {
            cuffLineRightOverlayMaterials.push(material);
          }
        }
      });
    };

    const createShortFineLineRoot = () => {
      shortFineLineRoot = createMaterialPrefixTextureOverlayRoot({
        name: "ShortFineLineOverlay",
        materialList: shortFineLineOverlayMaterials,
        color: kitPanelLayerState.shortFineLineColor,
        depthBias: 0.25,
        renderOrder: 25,
        targetPrefixes: ["short derecho", "short izquierdo"]
      });
    };

    const createShortThickLineRoot = () => {
      shortThickLineRoot = createMaterialPrefixTextureOverlayRoot({
        name: "ShortThickLineOverlay",
        materialList: shortThickLineOverlayMaterials,
        color: kitPanelLayerState.shortThickLineColor,
        depthBias: 0.25,
        renderOrder: 25,
        targetPrefixes: ["short derecho", "short izquierdo"]
      });
    };

    const createShortBottomLineRoot = () => {
      shortBottomLineRoot = createMaterialPrefixTextureOverlayRoot({
        name: "ShortBottomLineOverlay",
        materialList: shortBottomLineOverlayMaterials,
        color: kitPanelLayerState.shortBottomLineColor,
        depthBias: 0.25,
        renderOrder: 25,
        targetPrefixes: ["short derecho", "short izquierdo"]
      });
    };

    const createStarbadeLogoStrokeRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "StarbadeLogoStrokeOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const placementKey = getStarbadeLogoPlacementKey(material);

          return placementKey && getStarbadeLogoStrokePlacement(placementKey)
            ? createStarbadeLogoStrokeOverlayMaterial(material, placementKey)
            : emptyDesignOverlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 29;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      starbadeLogoStrokeRoot = overlayRoot;
      scene.add(starbadeLogoStrokeRoot);
    };

    const createStarbadeLogoRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "StarbadeLogoOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const placementKey = getStarbadeLogoPlacementKey(material);

          return placementKey && getStarbadeLogoPlacement(placementKey)
            ? createStarbadeLogoOverlayMaterial(material, placementKey)
            : emptyDesignOverlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 30;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      starbadeLogoRoot = overlayRoot;
      scene.add(starbadeLogoRoot);
    };

    const createFrontShieldRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "FrontShieldOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const cleanName = material?.name?.toLowerCase?.() || "";
          const isShieldTarget = (
            cleanName.startsWith("frente") ||
            cleanName.startsWith("espalda") ||
            cleanName.startsWith("short derecho")
          );

          return isShieldTarget
            ? createFrontShieldOverlayMaterial(material)
            : emptyDesignOverlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 40;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      frontShieldRoot = overlayRoot;
      scene.add(frontShieldRoot);
    };

    const createBackDorsalRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "BackDorsalOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const cleanName = material?.name?.toLowerCase?.() || "";
          const isBackTarget = cleanName.startsWith("espalda");

          return isBackTarget
            ? createBackDorsalOverlayMaterial(material)
            : emptyDesignOverlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 50;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      backDorsalRoot = overlayRoot;
      scene.add(backDorsalRoot);
    };

    const createBackDorsalStrokeRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "BackDorsalStrokeOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const cleanName = material?.name?.toLowerCase?.() || "";
          const isBackTarget = cleanName.startsWith("espalda");

          return isBackTarget
            ? createBackDorsalStrokeOverlayMaterial(material)
            : emptyDesignOverlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 49;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      backDorsalStrokeRoot = overlayRoot;
      scene.add(backDorsalStrokeRoot);
    };

    const createShortDorsalRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "ShortDorsalNumberOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const cleanName = material?.name?.toLowerCase?.() || "";
          const isShortLeftTarget = cleanName.startsWith("short izquierdo");

          return isShortLeftTarget
            ? createShortDorsalOverlayMaterial(material)
            : emptyDesignOverlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 52;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      shortDorsalRoot = overlayRoot;
      scene.add(shortDorsalRoot);
    };

    const createBackDorsalNameRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "BackDorsalNameOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const cleanName = material?.name?.toLowerCase?.() || "";
          const isBackTarget = cleanName.startsWith("espalda");

          return isBackTarget
            ? createBackDorsalNameOverlayMaterial(material)
            : emptyDesignOverlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 51;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      backDorsalNameRoot = overlayRoot;
      scene.add(backDorsalNameRoot);
    };

    const createBackDorsalNameStrokeRoot = () => {
      if (!modelRoot) return;

      const overlayRoot = modelRoot.clone(true);
      const nodesToRemove = [];

      overlayRoot.name = "BackDorsalNameStrokeOverlay";
      overlayRoot.visible = false;

      overlayRoot.traverse((child) => {
        if (!child.isMesh) return;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const overlayMaterials = materials.map((material) => {
          const cleanName = material?.name?.toLowerCase?.() || "";
          const isBackTarget = cleanName.startsWith("espalda");

          return isBackTarget
            ? createBackDorsalNameStrokeOverlayMaterial(material)
            : emptyDesignOverlayMaterial;
        });
        const hasOverlayMaterial = overlayMaterials.some((material) => (
          material !== emptyDesignOverlayMaterial
        ));

        if (!hasOverlayMaterial) {
          nodesToRemove.push(child);
          return;
        }

        child.material = Array.isArray(child.material)
          ? overlayMaterials
          : overlayMaterials[0];
        child.renderOrder = 50;
        child.frustumCulled = true;
      });

      nodesToRemove.forEach((node) => {
        node.parent?.remove(node);
      });

      backDorsalNameStrokeRoot = overlayRoot;
      scene.add(backDorsalNameStrokeRoot);
    };

    const setDesignOverlay = async (
      designId,
      color = kitDesignState.color,
      secondaryColor = kitDesignState.secondaryColor
    ) => {
      kitDesignState.selectedDesign = designId;
      kitDesignState.color = color;
      kitDesignState.secondaryColor = secondaryColor;

      const texturePath = getKitDesignTexturePath(designId);
      const secondaryTexturePath = getKitDesignTexturePath(designId, 2);
      const requestId = ++designTextureRequestId;

      designOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      secondaryDesignOverlayMaterials.forEach((material) => {
        material.color.set(secondaryColor);
        material.needsUpdate = true;
      });

      redrawFrontAssetTexture(shortLogoState.shieldEnabled);

      if (!designOverlayRoot || !texturePath) {
        if (designOverlayRoot) {
          designOverlayRoot.visible = false;
        }

        if (secondaryDesignOverlayRoot) {
          secondaryDesignOverlayRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const [texture, secondaryTexture] = await Promise.all([
          loadDesignTexture(designId),
          secondaryTexturePath
            ? loadDesignTexture(designId, 2)
            : Promise.resolve(null)
        ]);

        if (requestId !== designTextureRequestId || !texture) return;

        designOverlayMaterials.forEach((material) => {
          material.map = texture;
          material.needsUpdate = true;
        });

        secondaryDesignOverlayMaterials.forEach((material) => {
          material.map = secondaryTexture;
          material.needsUpdate = true;
        });

        designOverlayRoot.visible = true;

        if (secondaryDesignOverlayRoot) {
          secondaryDesignOverlayRoot.visible = Boolean(secondaryTexture);
        }

        render();
      } catch (error) {
        console.warn("No se pudo cargar el diseño seleccionado.", error);

        if (requestId === designTextureRequestId && designOverlayRoot) {
          designOverlayRoot.visible = false;

          if (secondaryDesignOverlayRoot) {
            secondaryDesignOverlayRoot.visible = false;
          }

          render();
        }
      }
    };

    const setShoulderPanelOverlay = async (texturePath, color = kitPanelLayerState.shoulderColor) => {
      const requestId = ++shoulderPanelRequestId;

      shoulderPanelOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!shoulderPanelRoot || !texturePath) {
        if (shoulderPanelRoot) {
          shoulderPanelRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const texture = await loadPanelTexture(texturePath);

        if (requestId !== shoulderPanelRequestId || !texture) return;

        shoulderPanelOverlayMaterials.forEach((material) => {
          material.map = texture;
          material.needsUpdate = true;
        });

        shoulderPanelRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el panel de hombros.", error);

        if (requestId === shoulderPanelRequestId && shoulderPanelRoot) {
          shoulderPanelRoot.visible = false;
          render();
        }
      }
    };

    const setShoulderPanelBorderOverlay = async (
      texturePath,
      color = kitPanelLayerState.shoulderBorderColor
    ) => {
      const requestId = ++shoulderPanelBorderRequestId;

      shoulderPanelBorderOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!shoulderPanelBorderRoot || !texturePath) {
        if (shoulderPanelBorderRoot) {
          shoulderPanelBorderRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const texture = await loadPanelTexture(texturePath);

        if (requestId !== shoulderPanelBorderRequestId || !texture) return;

        shoulderPanelBorderOverlayMaterials.forEach((material) => {
          material.map = texture;
          material.needsUpdate = true;
        });

        shoulderPanelBorderRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el borde de hombros.", error);

        if (requestId === shoulderPanelBorderRequestId && shoulderPanelBorderRoot) {
          shoulderPanelBorderRoot.visible = false;
          render();
        }
      }
    };

    const setSidePanelOverlay = async (texturePath, color = kitPanelLayerState.sideColor) => {
      const requestId = ++sidePanelRequestId;

      sidePanelOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!sidePanelRoot || !texturePath) {
        if (sidePanelRoot) {
          sidePanelRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const texture = await loadPanelTexture(texturePath);

        if (requestId !== sidePanelRequestId || !texture) return;

        sidePanelOverlayMaterials.forEach((material) => {
          material.map = texture;
          material.needsUpdate = true;
        });

        sidePanelRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el panel lateral.", error);

        if (requestId === sidePanelRequestId && sidePanelRoot) {
          sidePanelRoot.visible = false;
          render();
        }
      }
    };

    const setSidePanelBorderOverlay = async (
      texturePath,
      color = kitPanelLayerState.sideBorderColor
    ) => {
      const requestId = ++sidePanelBorderRequestId;

      sidePanelBorderOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!sidePanelBorderRoot || !texturePath) {
        if (sidePanelBorderRoot) {
          sidePanelBorderRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const texture = await loadPanelTexture(texturePath);

        if (requestId !== sidePanelBorderRequestId || !texture) return;

        sidePanelBorderOverlayMaterials.forEach((material) => {
          material.map = texture;
          material.needsUpdate = true;
        });

        sidePanelBorderRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el borde lateral.", error);

        if (requestId === sidePanelBorderRequestId && sidePanelBorderRoot) {
          sidePanelBorderRoot.visible = false;
          render();
        }
      }
    };

    const setSingleTextureOverlay = async ({
      texturePath,
      color,
      requestId,
      root,
      materials,
      onRequest,
      isCurrent,
      warning
    }) => {
      const currentRequestId = onRequest(requestId + 1);

      materials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!root || !texturePath) {
        if (root) {
          root.visible = false;
        }

        render();
        return;
      }

      try {
        const texture = await loadPanelTexture(texturePath);

        if (!isCurrent(currentRequestId) || !texture) return;

        materials.forEach((material) => {
          material.map = texture;
          material.needsUpdate = true;
        });

        root.visible = true;
        render();
      } catch (error) {
        console.warn(warning, error);

        if (isCurrent(currentRequestId) && root) {
          root.visible = false;
          render();
        }
      }
    };

    const setNeckLineOverlay = async (texturePath, color = kitPanelLayerState.neckLineColor) => {
      const nextRequestId = neckLineRequestId + 1;

      await setSingleTextureOverlay({
        texturePath,
        color,
        requestId: neckLineRequestId,
        root: neckLineRoot,
        materials: neckLineOverlayMaterials,
        onRequest(value) {
          neckLineRequestId = value;
          return value;
        },
        isCurrent(value) {
          return value === neckLineRequestId;
        },
        warning: "No se pudo cargar la linea de cuello."
      });

      neckLineRequestId = Math.max(neckLineRequestId, nextRequestId);
    };

    const setCuffLineOverlayColors = (colors = kitPanelLayerState.cuffLineColor) => {
      const leftColor = typeof colors === "object" && colors
        ? colors.left
        : colors;
      const rightColor = typeof colors === "object" && colors
        ? colors.right
        : colors;
      const fallbackColor = kitPanelLayerState.cuffLineColor;

      cuffLineLeftOverlayMaterials.forEach((material) => {
        material.color.set(leftColor || fallbackColor);
        material.needsUpdate = true;
      });

      cuffLineRightOverlayMaterials.forEach((material) => {
        material.color.set(rightColor || fallbackColor);
        material.needsUpdate = true;
      });

      if (!cuffLineLeftOverlayMaterials.length && !cuffLineRightOverlayMaterials.length) {
        cuffLineOverlayMaterials.forEach((material) => {
          material.color.set(fallbackColor);
          material.needsUpdate = true;
        });
      }
    };

    const setCuffLineOverlay = async (texturePath, colors = kitPanelLayerState.cuffLineColor) => {
      const currentRequestId = ++cuffLineRequestId;

      setCuffLineOverlayColors(colors);

      if (!cuffLineRoot || !texturePath) {
        if (cuffLineRoot) {
          cuffLineRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const texture = await loadPanelTexture(texturePath);

        if (currentRequestId !== cuffLineRequestId || !texture) return;

        cuffLineOverlayMaterials.forEach((material) => {
          material.map = texture;
          material.needsUpdate = true;
        });

        setCuffLineOverlayColors(colors);
        cuffLineRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar la linea de puños.", error);

        if (currentRequestId === cuffLineRequestId && cuffLineRoot) {
          cuffLineRoot.visible = false;
          render();
        }
      }
    };

    const setCuffLineOverlayLegacy = async (texturePath, color = kitPanelLayerState.cuffLineColor) => {
      const nextRequestId = cuffLineRequestId + 1;

      await setSingleTextureOverlay({
        texturePath,
        color,
        requestId: cuffLineRequestId,
        root: cuffLineRoot,
        materials: cuffLineOverlayMaterials,
        onRequest(value) {
          cuffLineRequestId = value;
          return value;
        },
        isCurrent(value) {
          return value === cuffLineRequestId;
        },
        warning: "No se pudo cargar la linea de puños."
      });

      cuffLineRequestId = Math.max(cuffLineRequestId, nextRequestId);
    };

    const setShortFineLineOverlay = async (
      texturePath,
      color = kitPanelLayerState.shortFineLineColor
    ) => {
      const nextRequestId = shortFineLineRequestId + 1;

      await setSingleTextureOverlay({
        texturePath,
        color,
        requestId: shortFineLineRequestId,
        root: shortFineLineRoot,
        materials: shortFineLineOverlayMaterials,
        onRequest(value) {
          shortFineLineRequestId = value;
          return value;
        },
        isCurrent(value) {
          return value === shortFineLineRequestId;
        },
        warning: "No se pudo cargar la linea fina del short."
      });

      shortFineLineRequestId = Math.max(shortFineLineRequestId, nextRequestId);
    };

    const setShortThickLineOverlay = async (
      texturePath,
      color = kitPanelLayerState.shortThickLineColor
    ) => {
      const nextRequestId = shortThickLineRequestId + 1;

      await setSingleTextureOverlay({
        texturePath,
        color,
        requestId: shortThickLineRequestId,
        root: shortThickLineRoot,
        materials: shortThickLineOverlayMaterials,
        onRequest(value) {
          shortThickLineRequestId = value;
          return value;
        },
        isCurrent(value) {
          return value === shortThickLineRequestId;
        },
        warning: "No se pudo cargar la linea gruesa del short."
      });

      shortThickLineRequestId = Math.max(shortThickLineRequestId, nextRequestId);
    };

    const setShortBottomLineOverlay = async (
      texturePath,
      color = kitPanelLayerState.shortBottomLineColor
    ) => {
      const nextRequestId = shortBottomLineRequestId + 1;

      await setSingleTextureOverlay({
        texturePath,
        color,
        requestId: shortBottomLineRequestId,
        root: shortBottomLineRoot,
        materials: shortBottomLineOverlayMaterials,
        onRequest(value) {
          shortBottomLineRequestId = value;
          return value;
        },
        isCurrent(value) {
          return value === shortBottomLineRequestId;
        },
        warning: "No se pudo cargar la linea inferior del short."
      });

      shortBottomLineRequestId = Math.max(shortBottomLineRequestId, nextRequestId);
    };

    const setStarbadeLogoOverlay = async (placementKey, color = starbadeLogoState.logoColor) => {
      if (placementKey === "back") {
        starbadeLogoState.backLogoColor = color;
      } else if (placementKey === "shortLeft") {
        shortLogoState.starbadeLogoColor = color;
      } else {
        starbadeLogoState.logoColor = color;
      }

      starbadeLogoOverlayMaterials.forEach((entry) => {
        if (entry.placementKey !== placementKey) return;

        entry.material.color.set(color);
        entry.material.needsUpdate = true;
      });

      if (!starbadeLogoRoot || !getStarbadeLogoPlacement(placementKey)) {
        render();
        return;
      }

      try {
        await loadStarbadeLogoImage();
        redrawStarbadeLogoTexture();

        starbadeLogoRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el logo Starbade.", error);
        starbadeLogoRoot.visible = false;
        render();
      }
    };

    const setStarbadeLogoStrokeOverlay = async (
      placementKey,
      enabled,
      color = starbadeLogoState.strokeColor
    ) => {
      if (placementKey === "back") {
        starbadeLogoState.backStrokeColor = color;
        starbadeLogoState.backStrokeEnabled = enabled;
      } else {
        starbadeLogoState.strokeColor = color;
        starbadeLogoState.strokeEnabled = enabled;
      }

      starbadeLogoStrokeOverlayMaterials.forEach((entry) => {
        if (entry.placementKey !== placementKey) return;

        entry.material.color.set(color);
        entry.material.visible = enabled;
        entry.material.needsUpdate = true;
      });

      if (!starbadeLogoStrokeRoot || !getStarbadeLogoStrokePlacement(placementKey)) {
        render();
        return;
      }

      if (!hasEnabledStarbadeLogoStroke()) {
        starbadeLogoStrokeRoot.visible = false;
        render();
        return;
      }

      try {
        await loadStarbadeLogoStrokeImage();
        redrawStarbadeLogoStrokeTexture();

        starbadeLogoStrokeRoot.visible = hasEnabledStarbadeLogoStroke();
        render();
      } catch (error) {
        console.warn("No se pudo cargar el trazo Starbade.", error);
        starbadeLogoStrokeRoot.visible = false;
        render();
      }
    };

    const setFrontShieldOverlay = async (imageSrc, showShortShield = false) => {
      const requestId = ++frontShieldRequestId;
      const hasVisibleAsset = () => Boolean(frontShieldImage || frontSponsorImage || backSponsorImage);

      if (!frontShieldRoot || !imageSrc) {
        frontShieldImageSrc = "";
        frontShieldImage = null;
        redrawFrontAssetTexture(false);

        if (frontShieldRoot) {
          frontShieldRoot.visible = hasVisibleAsset();
        }

        render();
        return;
      }

      try {
        const image = await loadFrontShieldImage(imageSrc);

        if (requestId !== frontShieldRequestId) return;

        frontShieldImage = image;
        redrawFrontAssetTexture(showShortShield);

        frontShieldRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el escudo.", error);

        if (requestId === frontShieldRequestId) {
          frontShieldImageSrc = "";
          frontShieldImage = null;
          redrawFrontAssetTexture(false);
          frontShieldRoot.visible = hasVisibleAsset();
          render();
        }
      }
    };

    const setFrontSponsorOverlay = async (imageSrc) => {
      const requestId = ++frontSponsorRequestId;
      const hasVisibleAsset = () => Boolean(frontShieldImage || frontSponsorImage || backSponsorImage);

      if (!frontShieldRoot || !imageSrc) {
        frontSponsorImageSrc = "";
        frontSponsorImage = null;
        redrawFrontAssetTexture(shortLogoState.shieldEnabled);

        if (frontShieldRoot) {
          frontShieldRoot.visible = hasVisibleAsset();
        }

        render();
        return;
      }

      try {
        const image = await loadFrontSponsorImage(imageSrc);

        if (requestId !== frontSponsorRequestId) return;

        frontSponsorImage = image;
        redrawFrontAssetTexture(shortLogoState.shieldEnabled);

        frontShieldRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el sponsor frontal.", error);

        if (requestId === frontSponsorRequestId) {
          frontSponsorImageSrc = "";
          frontSponsorImage = null;
          redrawFrontAssetTexture(shortLogoState.shieldEnabled);
          frontShieldRoot.visible = hasVisibleAsset();
          render();
        }
      }
    };

    const setBackSponsorOverlay = async (imageSrc) => {
      const requestId = ++backSponsorRequestId;
      const hasVisibleAsset = () => Boolean(frontShieldImage || frontSponsorImage || backSponsorImage);

      if (!frontShieldRoot || !imageSrc) {
        backSponsorImageSrc = "";
        backSponsorImage = null;
        redrawFrontAssetTexture(shortLogoState.shieldEnabled);

        if (frontShieldRoot) {
          frontShieldRoot.visible = hasVisibleAsset();
        }

        render();
        return;
      }

      try {
        const image = await loadBackSponsorImage(imageSrc);

        if (requestId !== backSponsorRequestId) return;

        backSponsorImage = image;
        redrawFrontAssetTexture(shortLogoState.shieldEnabled);

        frontShieldRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el sponsor de espalda.", error);

        if (requestId === backSponsorRequestId) {
          backSponsorImageSrc = "";
          backSponsorImage = null;
          redrawFrontAssetTexture(shortLogoState.shieldEnabled);
          frontShieldRoot.visible = hasVisibleAsset();
          render();
        }
      }
    };

    const setBackDorsalNumberOverlay = async (imageSrc, color = dorsalNumberState.numberColor) => {
      const requestId = ++backDorsalNumberRequestId;

      backDorsalOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!backDorsalRoot || !imageSrc) {
        backDorsalNumberImageSrc = "";
        backDorsalNumberImage = null;
        redrawBackDorsalTexture();

        if (backDorsalRoot) {
          backDorsalRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const image = await loadBackDorsalNumberImage(imageSrc);

        if (requestId !== backDorsalNumberRequestId) return;

        backDorsalNumberImage = image;
        redrawBackDorsalTexture();

        backDorsalRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el dorsal de espalda.", error);

        if (requestId === backDorsalNumberRequestId) {
          backDorsalNumberImageSrc = "";
          backDorsalNumberImage = null;
          redrawBackDorsalTexture();
          backDorsalRoot.visible = false;
          render();
        }
      }
    };

    const setBackDorsalNumberStrokeOverlay = async (
      imageSrc,
      color = dorsalNumberState.strokeColor
    ) => {
      const requestId = ++backDorsalNumberStrokeRequestId;

      backDorsalStrokeOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!backDorsalStrokeRoot || !imageSrc) {
        backDorsalNumberStrokeImageSrc = "";
        backDorsalNumberStrokeImage = null;
        redrawBackDorsalStrokeTexture();

        if (backDorsalStrokeRoot) {
          backDorsalStrokeRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const image = await loadBackDorsalNumberStrokeImage(imageSrc);

        if (requestId !== backDorsalNumberStrokeRequestId) return;

        backDorsalNumberStrokeImage = image;
        redrawBackDorsalStrokeTexture();

        backDorsalStrokeRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el trazo del dorsal de espalda.", error);

        if (requestId === backDorsalNumberStrokeRequestId) {
          backDorsalNumberStrokeImageSrc = "";
          backDorsalNumberStrokeImage = null;
          redrawBackDorsalStrokeTexture();
          backDorsalStrokeRoot.visible = false;
          render();
        }
      }
    };

    const setShortDorsalNumberOverlay = async (imageSrc, color = shortLogoState.numberColor) => {
      const requestId = ++shortDorsalNumberRequestId;

      shortDorsalOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!shortDorsalRoot || !imageSrc) {
        shortDorsalNumberImageSrc = "";
        shortDorsalNumberImage = null;
        redrawShortDorsalTexture();

        if (shortDorsalRoot) {
          shortDorsalRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const image = await loadShortDorsalNumberImage(imageSrc);

        if (requestId !== shortDorsalNumberRequestId) return;

        shortDorsalNumberImage = image;
        redrawShortDorsalTexture();

        shortDorsalRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el numero del short.", error);

        if (requestId === shortDorsalNumberRequestId) {
          shortDorsalNumberImageSrc = "";
          shortDorsalNumberImage = null;
          redrawShortDorsalTexture();
          shortDorsalRoot.visible = false;
          render();
        }
      }
    };

    const setBackDorsalNameStrokeOverlay = async (
      imageSrc,
      color = dorsalNumberState.nameStrokeColor
    ) => {
      const requestId = ++backDorsalNameStrokeRequestId;

      backDorsalNameStrokeOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!backDorsalNameStrokeRoot || !imageSrc) {
        backDorsalNameStrokeImageSrc = "";
        backDorsalNameStrokeImage = null;
        redrawBackDorsalNameStrokeTexture();

        if (backDorsalNameStrokeRoot) {
          backDorsalNameStrokeRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const image = await loadBackDorsalNameStrokeImage(imageSrc);

        if (requestId !== backDorsalNameStrokeRequestId) return;

        backDorsalNameStrokeImage = image;
        redrawBackDorsalNameStrokeTexture();

        backDorsalNameStrokeRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el trazo del nombre de espalda.", error);

        if (requestId === backDorsalNameStrokeRequestId) {
          backDorsalNameStrokeImageSrc = "";
          backDorsalNameStrokeImage = null;
          redrawBackDorsalNameStrokeTexture();
          backDorsalNameStrokeRoot.visible = false;
          render();
        }
      }
    };

    const setBackDorsalNameOverlay = async (imageSrc, color = dorsalNumberState.nameColor) => {
      const requestId = ++backDorsalNameRequestId;

      backDorsalNameOverlayMaterials.forEach((material) => {
        material.color.set(color);
        material.needsUpdate = true;
      });

      if (!backDorsalNameRoot || !imageSrc) {
        backDorsalNameImageSrc = "";
        backDorsalNameImage = null;
        redrawBackDorsalNameTexture();

        if (backDorsalNameRoot) {
          backDorsalNameRoot.visible = false;
        }

        render();
        return;
      }

      try {
        const image = await loadBackDorsalNameImage(imageSrc);

        if (requestId !== backDorsalNameRequestId) return;

        backDorsalNameImage = image;
        redrawBackDorsalNameTexture();

        backDorsalNameRoot.visible = true;
        render();
      } catch (error) {
        console.warn("No se pudo cargar el nombre de espalda.", error);

        if (requestId === backDorsalNameRequestId) {
          backDorsalNameImageSrc = "";
          backDorsalNameImage = null;
          redrawBackDorsalNameTexture();
          backDorsalNameRoot.visible = false;
          render();
        }
      }
    };

    const clearMaterialGroups = () => {
      Object.keys(materialGroups).forEach((key) => {
        delete materialGroups[key];
      });
    };

    const clearOverlayMaterialLists = () => {
      designOverlayMaterials.length = 0;
      secondaryDesignOverlayMaterials.length = 0;
      shoulderPanelOverlayMaterials.length = 0;
      shoulderPanelBorderOverlayMaterials.length = 0;
      sidePanelOverlayMaterials.length = 0;
      sidePanelBorderOverlayMaterials.length = 0;
      neckLineOverlayMaterials.length = 0;
      cuffLineOverlayMaterials.length = 0;
      cuffLineLeftOverlayMaterials.length = 0;
      cuffLineRightOverlayMaterials.length = 0;
      shortFineLineOverlayMaterials.length = 0;
      shortThickLineOverlayMaterials.length = 0;
      shortBottomLineOverlayMaterials.length = 0;
      starbadeLogoOverlayMaterials.length = 0;
      starbadeLogoStrokeOverlayMaterials.length = 0;
      frontShieldOverlayMaterials.length = 0;
      backDorsalOverlayMaterials.length = 0;
      backDorsalStrokeOverlayMaterials.length = 0;
      shortDorsalOverlayMaterials.length = 0;
      backDorsalNameOverlayMaterials.length = 0;
      backDorsalNameStrokeOverlayMaterials.length = 0;
    };

    const removeCurrentModelStack = () => {
      [
        designOverlayRoot,
        secondaryDesignOverlayRoot,
        shoulderPanelRoot,
        shoulderPanelBorderRoot,
        sidePanelRoot,
        sidePanelBorderRoot,
        neckLineRoot,
        cuffLineRoot,
        shortFineLineRoot,
        shortThickLineRoot,
        shortBottomLineRoot,
        starbadeLogoStrokeRoot,
        starbadeLogoRoot,
        frontShieldRoot,
        backDorsalRoot,
        backDorsalStrokeRoot,
        shortDorsalRoot,
        backDorsalNameRoot,
        backDorsalNameStrokeRoot,
        modelRoot
      ].forEach((root) => {
        if (root?.parent) {
          root.parent.remove(root);
        }
      });

      designOverlayRoot = null;
      secondaryDesignOverlayRoot = null;
      shoulderPanelRoot = null;
      shoulderPanelBorderRoot = null;
      sidePanelRoot = null;
      sidePanelBorderRoot = null;
      neckLineRoot = null;
      cuffLineRoot = null;
      shortFineLineRoot = null;
      shortThickLineRoot = null;
      shortBottomLineRoot = null;
      starbadeLogoStrokeRoot = null;
      starbadeLogoRoot = null;
      frontShieldRoot = null;
      backDorsalRoot = null;
      backDorsalStrokeRoot = null;
      shortDorsalRoot = null;
      backDorsalNameRoot = null;
      backDorsalNameStrokeRoot = null;
      modelRoot = null;
    };

    const buildModelStack = (nextModelRoot) => {
      modelRoot = nextModelRoot;

      clearMaterialGroups();
      clearOverlayMaterialLists();

      modelRoot.traverse((child) => {
        if (!child.isMesh) return;

        child.frustumCulled = true;

        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (!material) return;

          material.side = isGarmentMaterial(material) ? THREE.DoubleSide : THREE.FrontSide;

          if (material.normalMap && material.normalScale) {
            material.normalScale.set(NORMAL_MAP_INTENSITY, NORMAL_MAP_INTENSITY);
          }

          if (FIXED_DARK_MATERIAL_NAMES.has(material.name)) {
            material.color.set("#292929");
          }

          applyMaterialDepthBias(material);

          material.needsUpdate = true;
          registerMaterial(material);
        });
      });

      scene.add(modelRoot);
      createDesignOverlayRoot();
      createSecondaryDesignOverlayRoot();
      createShoulderPanelRoot();
      createShoulderPanelBorderRoot();
      createSidePanelRoot();
      createSidePanelBorderRoot();
      createNeckLineRoot();
      createCuffLineRoot();
      createShortFineLineRoot();
      createShortThickLineRoot();
      createShortBottomLineRoot();
      createStarbadeLogoStrokeRoot();
      createStarbadeLogoRoot();
      createFrontShieldRoot();
      createBackDorsalRoot();
      createBackDorsalStrokeRoot();
      createShortDorsalRoot();
      createBackDorsalNameRoot();
      createBackDorsalNameStrokeRoot();
      resize();
    };

    const applyCurrentKitStateToModel = () => {
      [
        ["front", kitMaterialState.frontColor],
        ["back", kitMaterialState.backColor],
        ["neck", kitMaterialState.neckColor],
        ["polo", kitMaterialState.lapelColor],
        ["socks", kitMaterialState.socksColor]
      ].forEach(([groupKey, color]) => {
        if (color) applyKitMaterialColor(groupKey, color, false);
      });

      applyKitMaterialGroupsColor(
        ["shortLeft", "shortRight"],
        kitMaterialState.shortColor,
        false
      );

      applyDirtySplitGroupMaterialStates();
      applyKitDesignState();
      applyKitShoulderPanelState();
      applyKitShoulderPanelBorderState();
      applyKitSidePanelState();
      applyKitSidePanelBorderState();
      applyKitNeckLineState();
      applyKitCuffLineState();
      applyKitShortFineLineState();
      applyKitShortThickLineState();
      applyKitShortBottomLineState();
      applyKitStarbadeLogoState();
      applyKitStarbadeStrokeState();
      applyKitBackStarbadeLogoState();
      applyKitBackStarbadeStrokeState();
      applyKitShortStarbadeLogoState();
      applyFrontShieldState();
      applyFrontSponsorState();
      applyBackSponsorState();
      applyBackDorsalNumberState();
      applyBackDorsalNumberStrokeState();
      applyShortDorsalNumberState();
      applyBackDorsalNameState();
      applyBackDorsalNameStrokeState();
      setKitCameraView(kitCameraState.view);
      render();
    };

    const loader = new GLTFLoader();

    const loadMoldModel = async (moldKey, shouldReapplyState = true) => {
      const modelPath = kitMoldPaths[moldKey] || kitMoldPaths["classic-crew"];
      const modelUrl = encodeURI(modelPath);

      viewer3dStatus?.classList.remove("is-hidden");
      if (viewer3dStatus) {
        viewer3dStatus.textContent = "Cargando modelo...";
      }

      const gltf = await loader.loadAsync(modelUrl);

      removeCurrentModelStack();
      buildModelStack(gltf.scene);

      if (window.starbadeViewer3D) {
        window.starbadeViewer3D.model = modelRoot;
      }

      viewer3dStatus?.classList.add("is-hidden");

      if (shouldReapplyState) {
        applyCurrentKitStateToModel();
      }

      return modelRoot;
    };

    const setMoldModel = async (moldKey) => {
      if (!kitMoldPaths[moldKey] || selectedMold === moldKey) {
        syncMoldOptionItems();
        syncMoldDependentLabels();
        return;
      }

      selectedMold = moldKey;
      syncMoldOptionItems();
      syncMoldDependentLabels();
      syncLapelAvailability();
      disableRanglanSleevePanelsForCurrentDesign();
      closeLapelRulePopup();

      try {
        await loadMoldModel(moldKey, true);
      } catch (error) {
        console.warn("No se pudo cambiar el molde.", error);

        if (viewer3dStatus) {
          viewer3dStatus.textContent = "No se pudo cargar el modelo 3D.";
        }
      }
    };

    const setThemeMode = (mode) => {
      drawViewerBackground(mode === "light" ? "light" : "dark");
      viewerBackgroundTexture.needsUpdate = true;
      render();
    };

    await loadMoldModel(selectedMold, false);

    environmentReady.finally(render);

    controls.addEventListener("change", render);

    if ("ResizeObserver" in window) {
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(viewer3dRoot);
    } else {
      window.addEventListener("resize", resize);
    }

    viewer3dStatus?.classList.add("is-hidden");

    window.starbadeViewer3D = {
      scene,
      camera,
      renderer,
      controls,
      model: modelRoot,
      materialGroups,
      setDesign: setDesignOverlay,
      setShoulderPanel: setShoulderPanelOverlay,
      setShoulderPanelBorder: setShoulderPanelBorderOverlay,
      setSidePanel: setSidePanelOverlay,
      setSidePanelBorder: setSidePanelBorderOverlay,
      setNeckLine: setNeckLineOverlay,
      setCuffLine: setCuffLineOverlay,
      setShortFineLine: setShortFineLineOverlay,
      setShortThickLine: setShortThickLineOverlay,
      setShortBottomLine: setShortBottomLineOverlay,
      setStarbadeLogo: setStarbadeLogoOverlay,
      setStarbadeLogoStroke: setStarbadeLogoStrokeOverlay,
      setFrontShield: setFrontShieldOverlay,
      setFrontSponsor: setFrontSponsorOverlay,
      setBackSponsor: setBackSponsorOverlay,
      setBackDorsalNumber: setBackDorsalNumberOverlay,
      setBackDorsalNumberStroke: setBackDorsalNumberStrokeOverlay,
      setShortDorsalNumber: setShortDorsalNumberOverlay,
      setBackDorsalName: setBackDorsalNameOverlay,
      setBackDorsalNameStroke: setBackDorsalNameStrokeOverlay,
      setMold: setMoldModel,
      setThemeMode,
      render,
      resize,
      captureDesignImage
    };

    applyCurrentKitStateToModel();
  } catch (error) {
    console.warn("No se pudo cargar el visor 3D.", error);

    if (viewer3dStatus) {
      viewer3dStatus.textContent = "No se pudo cargar el modelo 3D.";
    }
  }
}

initKitViewer3D();

const colorPopup = document.getElementById("colorPopup");

const colorGrid = document.getElementById("colorGrid");
const recentColors = document.getElementById("recentColors");

const closeColorPopupBtn = document.getElementById("closeColorPopup");
const colorInfoBtn = document.getElementById("colorInfoBtn");
const colorPopupInfo = document.getElementById("colorPopupInfo");
const colorPopupHeaderText = document.querySelector(".color-popup-header-text");

const colorTargets = {
  front: {
    buttons: [
      document.getElementById("frontColorBtn"),
      document.getElementById("mobileFrontColorBtn")
    ],
    previews: [
      document.getElementById("frontPreviewCircle"),
      document.getElementById("mobileFrontPreviewCircle")
    ],
    validateColor(color) {
      return getMaterialColorConflictMessage("front", color);
    },
    onApply(color) {
      kitMaterialState.frontColor = color;
      applyKitMaterialColor("front", color);
      reconcileStarbadeLogoColorsForCurrentRules();
    }
  },
  back: {
    buttons: [
      document.getElementById("backColorBtn"),
      document.getElementById("mobileBackColorBtn")
    ],
    previews: [
      document.getElementById("backPreviewCircle"),
      document.getElementById("mobileBackPreviewCircle")
    ],
    validateColor(color) {
      return getMaterialColorConflictMessage("back", color);
    },
    onApply(color) {
      kitMaterialState.backColor = color;
      applyKitMaterialColor("back", color);
      reconcileStarbadeLogoColorsForCurrentRules();
    }
  },
  neck: {
    buttons: [
      document.getElementById("neckColorBtn"),
      document.getElementById("mobileNeckColorBtn")
    ],
    previews: [
      document.getElementById("neckPreviewCircle"),
      document.getElementById("mobileNeckPreviewCircle")
    ],
    onApply(color) {
      kitMaterialState.neckColor = color;
      applyKitMaterialColor("neck", color);
    }
  },
  lapel: {
    buttons: [
      document.getElementById("lapelColorBtn"),
      document.getElementById("mobileLapelColorBtn")
    ],
    previews: [
      document.getElementById("lapelPreviewCircle"),
      document.getElementById("mobileLapelPreviewCircle")
    ],
    onApply(color) {
      kitMaterialState.lapelColor = color;
      applyKitMaterialColor("polo", color);
    }
  },
  sleeves: {
    groupKey: "sleeves",
    mode: "combined",
    buttons: [
      document.getElementById("sleevesColorBtn"),
      document.getElementById("mobileSleevesColorBtn")
    ],
    previews: [
      document.getElementById("sleevesPreviewCircle"),
      document.getElementById("mobileSleevesPreviewCircle")
    ],
    validateColor(color) {
      return getMaterialColorConflictMessage("sleeves", color);
    }
  },
  sleevesLeft: {
    groupKey: "sleeves",
    mode: "left",
    buttons: [
      document.getElementById("sleevesLeftColorBtn"),
      document.getElementById("mobileSleevesLeftColorBtn")
    ],
    previews: [
      document.getElementById("sleevesLeftPreviewCircle"),
      document.getElementById("mobileSleevesLeftPreviewCircle")
    ],
    validateColor(color) {
      return getMaterialColorConflictMessage("sleevesLeft", color);
    }
  },
  sleevesRight: {
    groupKey: "sleeves",
    mode: "right",
    buttons: [
      document.getElementById("sleevesRightColorBtn"),
      document.getElementById("mobileSleevesRightColorBtn")
    ],
    previews: [
      document.getElementById("sleevesRightPreviewCircle"),
      document.getElementById("mobileSleevesRightPreviewCircle")
    ],
    validateColor(color) {
      return getMaterialColorConflictMessage("sleevesRight", color);
    }
  },
  cuffs: {
    groupKey: "cuffs",
    mode: "combined",
    buttons: [
      document.getElementById("cuffsColorBtn"),
      document.getElementById("mobileCuffsColorBtn")
    ],
    previews: [
      document.getElementById("cuffsPreviewCircle"),
      document.getElementById("mobileCuffsPreviewCircle")
    ]
  },
  cuffsLeft: {
    groupKey: "cuffs",
    mode: "left",
    buttons: [
      document.getElementById("cuffsLeftColorBtn"),
      document.getElementById("mobileCuffsLeftColorBtn")
    ],
    previews: [
      document.getElementById("cuffsLeftPreviewCircle"),
      document.getElementById("mobileCuffsLeftPreviewCircle")
    ]
  },
  cuffsRight: {
    groupKey: "cuffs",
    mode: "right",
    buttons: [
      document.getElementById("cuffsRightColorBtn"),
      document.getElementById("mobileCuffsRightColorBtn")
    ],
    previews: [
      document.getElementById("cuffsRightPreviewCircle"),
      document.getElementById("mobileCuffsRightPreviewCircle")
    ]
  },
  short: {
    buttons: [
      document.getElementById("shortColorBtn"),
      document.getElementById("mobileShortColorBtn")
    ],
    previews: [
      document.getElementById("shortPreviewCircle"),
      document.getElementById("mobileShortPreviewCircle")
    ],
    onApply(color) {
      kitMaterialState.shortColor = color;
      applyKitMaterialGroupsColor(["shortLeft", "shortRight"], color);
      reconcileShortStarbadeLogoColor();
    }
  },
  medias: {
    buttons: [
      document.getElementById("mediasColorBtn"),
      document.getElementById("mobileMediasColorBtn")
    ],
    previews: [
      document.getElementById("mediasPreviewCircle"),
      document.getElementById("mobileMediasPreviewCircle")
    ],
    onApply(color) {
      kitMaterialState.socksColor = color;
      applyKitMaterialColor("socks", color);
    }
  },
  design: {
    buttons: [
      document.getElementById("designColorBtn"),
      document.getElementById("mobileDesignColorBtn")
    ],
    previews: [
      document.getElementById("designPreviewCircle"),
      document.getElementById("mobileDesignPreviewCircle")
    ],
    validateColor(color) {
      return getDesignColorConflictMessage(color);
    },
    onApply(color) {
      setKitDesignLayerColor("primary", color);
    }
  },
  designSecondary: {
    buttons: [
      document.getElementById("designColor2Btn"),
      document.getElementById("mobileDesignColor2Btn")
    ],
    previews: [
      document.getElementById("designPreviewCircle2"),
      document.getElementById("mobileDesignPreviewCircle2")
    ],
    validateColor(color) {
      return getDesignColorConflictMessage(color);
    },
    onApply(color) {
      setKitDesignLayerColor("secondary", color);
    }
  },
  starbadeLogo: {
    buttons: [
      starbadeLogoColorBtn,
      mobileStarbadeLogoColorBtn
    ],
    previews: [
      starbadeLogoPreviewCircle,
      mobileStarbadeLogoPreviewCircle
    ],
    validateColor(color) {
      return getStarbadeLogoRuleConflictMessage("front", color);
    },
    getConflictColor() {
      return starbadeLogoState.strokeColor;
    },
    resolveColorConflict(color) {
      return swapFillStrokePairColors("frontStarbade", "fill", color);
    },
    onApply(color) {
      starbadeLogoState.logoColor = color;
      syncStrokePreview("starbadeStroke");
      applyKitStarbadeLogoState();
    }
  },
  starbadeStroke: {
    buttons: [
      starbadeStrokeColorBtn,
      mobileStarbadeStrokeColorBtn
    ],
    previews: [
      starbadeStrokePreviewCircle,
      mobileStarbadeStrokePreviewCircle
    ],
    previewMode: "border",
    getPreviewFillColor() {
      return starbadeLogoState.logoColor;
    },
    getConflictColor() {
      return starbadeLogoState.logoColor;
    },
    resolveColorConflict(color) {
      return swapFillStrokePairColors("frontStarbade", "stroke", color);
    },
    onApply(color) {
      starbadeLogoState.strokeColor = color;
      applyKitStarbadeStrokeState();
    }
  },
  backStarbadeLogo: {
    buttons: [
      backStarbadeLogoColorBtn,
      mobileBackStarbadeLogoColorBtn
    ],
    previews: [
      backStarbadeLogoPreviewCircle,
      mobileBackStarbadeLogoPreviewCircle
    ],
    validateColor(color) {
      return getStarbadeLogoRuleConflictMessage("back", color);
    },
    getConflictColor() {
      return starbadeLogoState.backStrokeColor;
    },
    resolveColorConflict(color) {
      return swapFillStrokePairColors("backStarbade", "fill", color);
    },
    onApply(color) {
      starbadeLogoState.backLogoColor = color;
      syncStrokePreview("backStarbadeStroke");
      applyKitBackStarbadeLogoState();
    }
  },
  backStarbadeStroke: {
    buttons: [
      backStarbadeStrokeColorBtn,
      mobileBackStarbadeStrokeColorBtn
    ],
    previews: [
      backStarbadeStrokePreviewCircle,
      mobileBackStarbadeStrokePreviewCircle
    ],
    previewMode: "border",
    getPreviewFillColor() {
      return starbadeLogoState.backLogoColor;
    },
    getConflictColor() {
      return starbadeLogoState.backLogoColor;
    },
    resolveColorConflict(color) {
      return swapFillStrokePairColors("backStarbade", "stroke", color);
    },
    onApply(color) {
      starbadeLogoState.backStrokeColor = color;
      applyKitBackStarbadeStrokeState();
    }
  },
  dorsalNumber: {
    buttons: [
      dorsalNumberColorBtn,
      mobileDorsalNumberColorBtn
    ],
    previews: [
      dorsalNumberPreviewCircle,
      mobileDorsalNumberPreviewCircle
    ],
    getConflictColor() {
      return dorsalNumberState.strokeColor;
    },
    resolveColorConflict(color) {
      return swapFillStrokePairColors("dorsalNumber", "fill", color);
    },
    onApply(color) {
      dorsalNumberState.numberColor = color;
      syncStrokePreview("dorsalNumberStroke");
      applyBackDorsalNumberState();
    }
  },
  dorsalNumberStroke: {
    buttons: [
      dorsalNumberStrokeColorBtn,
      mobileDorsalNumberStrokeColorBtn
    ],
    previews: [
      dorsalNumberStrokePreviewCircle,
      mobileDorsalNumberStrokePreviewCircle
    ],
    previewMode: "border",
    getPreviewFillColor() {
      return dorsalNumberState.numberColor;
    },
    getConflictColor() {
      return dorsalNumberState.numberColor;
    },
    resolveColorConflict(color) {
      return swapFillStrokePairColors("dorsalNumber", "stroke", color);
    },
    onApply(color) {
      dorsalNumberState.strokeColor = color;
      applyBackDorsalNumberStrokeState();
    }
  },
  dorsalName: {
    buttons: [
      dorsalNameColorBtn,
      mobileDorsalNameColorBtn
    ],
    previews: [
      dorsalNamePreviewCircle,
      mobileDorsalNamePreviewCircle
    ],
    getConflictColor() {
      return dorsalNumberState.nameStrokeColor;
    },
    resolveColorConflict(color) {
      return swapFillStrokePairColors("dorsalName", "fill", color);
    },
    onApply(color) {
      dorsalNumberState.nameColor = color;
      syncStrokePreview("dorsalNameStroke");
      applyBackDorsalNameState();
    }
  },
  dorsalNameStroke: {
    buttons: [
      dorsalNameStrokeColorBtn,
      mobileDorsalNameStrokeColorBtn
    ],
    previews: [
      dorsalNameStrokePreviewCircle,
      mobileDorsalNameStrokePreviewCircle
    ],
    previewMode: "border",
    getPreviewFillColor() {
      return dorsalNumberState.nameColor;
    },
    getConflictColor() {
      return dorsalNumberState.nameColor;
    },
    resolveColorConflict(color) {
      return swapFillStrokePairColors("dorsalName", "stroke", color);
    },
    onApply(color) {
      dorsalNumberState.nameStrokeColor = color;
      applyBackDorsalNameStrokeState();
    }
  },
  shortNumber: {
    buttons: [
      shortNumberColorBtn,
      mobileShortNumberColorBtn
    ],
    previews: [
      shortNumberPreviewCircle,
      mobileShortNumberPreviewCircle
    ],
    onApply(color) {
      shortLogoState.numberColor = color;
      applyShortDorsalNumberState();
    }
  },
  shortStarbadeLogo: {
    buttons: [
      shortStarbadeLogoColorBtn,
      mobileShortStarbadeLogoColorBtn
    ],
    previews: [
      shortStarbadeLogoPreviewCircle,
      mobileShortStarbadeLogoPreviewCircle
    ],
    validateColor(color) {
      return getShortStarbadeLogoConflictMessage(color);
    },
    onApply(color) {
      shortLogoState.starbadeLogoColor = color;
      applyKitShortStarbadeLogoState();
    }
  },
  panelHombros: {
    buttons: [
      panelHombrosBtn,
      mobilePanelHombrosBtn
    ],
    previews: [
      document.getElementById("panelHombrosPreviewCircle"),
      document.getElementById("mobilePanelHombrosPreviewCircle")
    ],
    onApply(color) {
      kitPanelLayerState.shoulderColor = color;
      applyKitShoulderPanelState();
    }
  },
  borderPanelHombros: {
    buttons: [
      borderPanelHombrosBtn,
      mobileBorderPanelHombrosBtn
    ],
    previews: [
      document.getElementById("borderPanelHombrosPreviewCircle"),
      document.getElementById("mobileBorderPanelHombrosPreviewCircle")
    ],
    onApply(color) {
      kitPanelLayerState.shoulderBorderColor = color;
      applyKitShoulderPanelBorderState();
    }
  },
  panelLaterales: {
    buttons: [
      panelLateralesBtn,
      mobilePanelLateralesBtn
    ],
    previews: [
      document.getElementById("panelLateralesPreviewCircle"),
      document.getElementById("mobilePanelLateralesPreviewCircle")
    ],
    onApply(color) {
      kitPanelLayerState.sideColor = color;
      applyKitSidePanelState();
    }
  },
  borderPanelLaterales: {
    buttons: [
      borderPanelLateralesBtn,
      mobileBorderPanelLateralesBtn
    ],
    previews: [
      document.getElementById("borderPanelLateralesPreviewCircle"),
      document.getElementById("mobileBorderPanelLateralesPreviewCircle")
    ],
    onApply(color) {
      kitPanelLayerState.sideBorderColor = color;
      applyKitSidePanelBorderState();
    }
  },
  lineCuello: {
    buttons: [
      lineCuelloBtn,
      mobileLineCuelloBtn
    ],
    previews: [
      document.getElementById("lineCuelloPreviewCircle"),
      document.getElementById("mobileLineCuelloPreviewCircle")
    ],
    onApply(color) {
      kitPanelLayerState.neckLineColor = color;
      applyKitNeckLineState();
    }
  },
  linePunos: {
    groupKey: "linePunos",
    mode: "combined",
    buttons: [
      linePunosBtn,
      mobileLinePunosBtn
    ],
    previews: [
      document.getElementById("linePunosPreviewCircle"),
      document.getElementById("mobileLinePunosPreviewCircle")
    ]
  },
  linePunosLeft: {
    groupKey: "linePunos",
    mode: "left",
    buttons: [
      linePunosLeftBtn,
      mobileLinePunosLeftBtn
    ],
    previews: [
      document.getElementById("linePunosLeftPreviewCircle"),
      document.getElementById("mobileLinePunosLeftPreviewCircle")
    ]
  },
  linePunosRight: {
    groupKey: "linePunos",
    mode: "right",
    buttons: [
      linePunosRightBtn,
      mobileLinePunosRightBtn
    ],
    previews: [
      document.getElementById("linePunosRightPreviewCircle"),
      document.getElementById("mobileLinePunosRightPreviewCircle")
    ]
  },
  lineFina: {
    buttons: [
      lineFinaBtn,
      mobileLineFinaBtn
    ],
    previews: [
      document.getElementById("lineFinaPreviewCircle"),
      document.getElementById("mobileLineFinaPreviewCircle")
    ],
    onApply(color) {
      kitPanelLayerState.shortFineLineColor = color;
      applyKitShortFineLineState();
    }
  },
  lineGruesa: {
    buttons: [
      lineGruesaBtn,
      mobileLineGruesaBtn
    ],
    previews: [
      document.getElementById("lineGruesaPreviewCircle"),
      document.getElementById("mobileLineGruesaPreviewCircle")
    ],
    onApply(color) {
      kitPanelLayerState.shortThickLineColor = color;
      applyKitShortThickLineState();
    }
  },
  lineInferior: {
    buttons: [
      lineInferiorBtn,
      mobileLineInferiorBtn
    ],
    previews: [
      document.getElementById("lineInferiorPreviewCircle"),
      document.getElementById("mobileLineInferiorPreviewCircle")
    ],
    onApply(color) {
      kitPanelLayerState.shortBottomLineColor = color;
      applyKitShortBottomLineState();
    }
  }
};

const splitGroups = {
  sleeves: {
    containers: [
      document.getElementById("sleevesGroup"),
      document.getElementById("mobileSleevesGroup")
    ],
    toggleButtons: [
      document.getElementById("sleevesSplitToggle"),
      document.getElementById("mobileSleevesSplitToggle")
    ],
    mainPreviews: [
      document.getElementById("sleevesPreviewCircle"),
      document.getElementById("mobileSleevesPreviewCircle")
    ],
    leftPreviews: [
      document.getElementById("sleevesLeftPreviewCircle"),
      document.getElementById("mobileSleevesLeftPreviewCircle")
    ],
    rightPreviews: [
      document.getElementById("sleevesRightPreviewCircle"),
      document.getElementById("mobileSleevesRightPreviewCircle")
    ],
    combinedColor: initialRed,
    leftColor: initialWhite,
    rightColor: initialBlack,
    hasModelColor: true
  },
  cuffs: {
    containers: [
      document.getElementById("cuffsGroup"),
      document.getElementById("mobileCuffsGroup")
    ],
    toggleButtons: [
      document.getElementById("cuffsSplitToggle"),
      document.getElementById("mobileCuffsSplitToggle")
    ],
    mainPreviews: [
      document.getElementById("cuffsPreviewCircle"),
      document.getElementById("mobileCuffsPreviewCircle")
    ],
    leftPreviews: [
      document.getElementById("cuffsLeftPreviewCircle"),
      document.getElementById("mobileCuffsLeftPreviewCircle")
    ],
    rightPreviews: [
      document.getElementById("cuffsRightPreviewCircle"),
      document.getElementById("mobileCuffsRightPreviewCircle")
    ],
    combinedColor: initialWhite,
    leftColor: initialWhite,
    rightColor: initialBlack,
    hasModelColor: true
  },
  linePunos: {
    containers: [
      document.getElementById("linePunosGroup"),
      document.getElementById("mobileLinePunosGroup")
    ],
    toggleButtons: [
      linePunosSplitToggle,
      mobileLinePunosSplitToggle
    ],
    mainPreviews: [
      document.getElementById("linePunosPreviewCircle"),
      document.getElementById("mobileLinePunosPreviewCircle")
    ],
    leftPreviews: [
      document.getElementById("linePunosLeftPreviewCircle"),
      document.getElementById("mobileLinePunosLeftPreviewCircle")
    ],
    rightPreviews: [
      document.getElementById("linePunosRightPreviewCircle"),
      document.getElementById("mobileLinePunosRightPreviewCircle")
    ],
    combinedColor: initialBlackMid,
    leftColor: initialWhite,
    rightColor: initialBlack,
    hasModelColor: true
  }
};

const splitMaterialGroups = {
  sleeves: {
    combined: ["leftSleeve", "rightSleeve"],
    left: ["leftSleeve"],
    right: ["rightSleeve"]
  },
  cuffs: {
    combined: ["leftCuff", "rightCuff"],
    left: ["leftCuff"],
    right: ["rightCuff"]
  }
};

function setPreviewBackgrounds(previews, background) {
  if (!previews?.forEach) return;

  previews.forEach((preview) => {
    if (!preview) return;

    preview.style.background = background;
  });
}

function syncInitialColorPreviews() {
  [
    ["front", kitMaterialState.frontColor],
    ["back", kitMaterialState.backColor],
    ["neck", kitMaterialState.neckColor],
    ["lapel", kitMaterialState.lapelColor],
    ["short", kitMaterialState.shortColor],
    ["medias", kitMaterialState.socksColor],
    ["design", kitDesignState.color],
    ["designSecondary", kitDesignState.secondaryColor],
    ["panelHombros", kitPanelLayerState.shoulderColor],
    ["borderPanelHombros", kitPanelLayerState.shoulderBorderColor],
    ["panelLaterales", kitPanelLayerState.sideColor],
    ["borderPanelLaterales", kitPanelLayerState.sideBorderColor],
    ["lineCuello", kitPanelLayerState.neckLineColor],
    ["starbadeLogo", starbadeLogoState.logoColor],
    ["backStarbadeLogo", starbadeLogoState.backLogoColor],
    ["shortStarbadeLogo", shortLogoState.starbadeLogoColor],
    ["dorsalNumber", dorsalNumberState.numberColor],
    ["dorsalName", dorsalNumberState.nameColor]
  ].forEach(([targetKey, color]) => {
    setColorPreviewBackgrounds(colorTargets[targetKey]?.previews || [], color);
  });
}

function syncStrokePreview(targetKey, borderColor, previewBorderColor = getPreviewColorForModelColor(borderColor)) {
  const target = colorTargets[targetKey];

  if (!target || target.previewMode !== "border") return;

  const fillColor = target.getPreviewFillColor
    ? getPreviewColorForModelColor(target.getPreviewFillColor())
    : "transparent";

  target.previews.forEach((preview) => {
    if (!preview) return;

    preview.style.background = fillColor;

    if (borderColor) {
      preview.style.borderColor = previewBorderColor;
    }
  });
}

function syncAllStrokePreviews() {
  syncStrokePreview("starbadeStroke", starbadeLogoState.strokeColor);
  syncStrokePreview("backStarbadeStroke", starbadeLogoState.backStrokeColor);
  syncStrokePreview("dorsalNumberStroke", dorsalNumberState.strokeColor);
  syncStrokePreview("dorsalNameStroke", dorsalNumberState.nameStrokeColor);
}

function normalizeColorValue(color) {
  return String(color || "").trim().toLowerCase();
}

function isSameColor(colorA, colorB) {
  return normalizeColorValue(colorA) === normalizeColorValue(colorB);
}

function getCurrentSleeveColors() {
  const sleeves = splitGroups.sleeves;

  if (!sleeves) return [];

  return isSplitGroupActive("sleeves")
    ? [sleeves.leftColor, sleeves.rightColor]
    : [sleeves.combinedColor];
}

function getCurrentDesignColorsBlockedForMaterial(materialKey) {
  const target = normalizeDesignMaterialTarget(materialKey);

  if (!target) return [];

  if (twoColorDesigns.has(kitDesignState.selectedDesign)) {
    return (
      doesCurrentTwoColorDesignTargetMaterial(target) &&
      isSameColor(kitDesignState.color, kitDesignState.secondaryColor)
    )
      ? [kitDesignState.color].filter(Boolean)
      : [];
  }

  if (target === "sleeves") {
    return getCurrentSleeveBlockedDesignColors();
  }

  if (
    isCurrentDesignSingleColor() &&
    !isCurrentDesignSleeveOnly() &&
    !(target === "back" && canBackMatchCurrentDesignColor())
  ) {
    return [kitDesignState.color].filter(Boolean);
  }

  return [];
}

function getDesignMaterialColorConflicts(color) {
  const conflicts = [];

  const twoColorTargets = getCurrentTwoColorDesignMaterialTargets();

  if (twoColorTargets.length) {
    return conflicts;
  }

  if (isCurrentDesignSingleColor() && !isCurrentDesignSleeveOnly()) {
    if (isSameColor(color, kitMaterialState.frontColor)) {
      conflicts.push("el frente");
    }

    if (!canBackMatchCurrentDesignColor() && isSameColor(color, kitMaterialState.backColor)) {
      conflicts.push("la espalda");
    }
  }

  if (
    doesCurrentDesignBlockSleeveDesignColorMatch() &&
    getCurrentSleeveColors().some((sleeveColor) => isSameColor(color, sleeveColor))
  ) {
    conflicts.push("las mangas");
  }

  return conflicts;
}

function formatConflictList(items) {
  if (items.length <= 1) return items[0] || "";
  if (items.length === 2) return `${items[0]} y ${items[1]}`;

  return `${items.slice(0, -1).join(", ")} y ${items.at(-1)}`;
}

function getStarbadeLogoRuleConflictMessage(placement, color) {
  const rules = getCurrentDesignRules();
  const singleColorRules = getCurrentSingleColorDesignRules();

  if (!rules && !isNoDesignSelected()) return "";

  const isBack = placement === "back";
  const materialColor = isBack
    ? kitMaterialState.backColor
    : kitMaterialState.frontColor;
  const materialLabel = isBack ? "la espalda" : "el frente";
  const logoLabel = isBack ? "de la espalda" : "del frente";
  const primaryDesignMatchesFront = (
    frontLogoBlockedWhenPrimaryDesignMatchesFront.has(kitDesignState.selectedDesign) &&
    isSameColor(kitDesignState.color, kitMaterialState.frontColor)
  );
  const primaryDesignMatchesBack = (
    backLogoBlockedWhenPrimaryDesignMatchesBack.has(kitDesignState.selectedDesign) &&
    isSameColor(kitDesignState.color, kitMaterialState.backColor)
  );
  const designColorsMatch = isSameColor(kitDesignState.color, kitDesignState.secondaryColor);
  const matchesMaterialAllowed = isBack
    ? Boolean(rules?.backLogoMatchesMaterial)
    : Boolean(rules?.frontLogoMatchesMaterial);
  const matchesDesignAllowed = singleColorRules
    ? (isBack
      ? singleColorRules.backLogoMatchesDesign
      : singleColorRules.frontLogoMatchesDesign)
    : true;

  if (!matchesMaterialAllowed && isSameColor(color, materialColor)) {
    return `El logo Starbade ${logoLabel} no puede tener el mismo color que ${materialLabel}.`;
  }

  if (!matchesDesignAllowed && isSameColor(color, kitDesignState.color)) {
    return `El logo Starbade ${logoLabel} no puede tener el mismo color que el diseño aplicado.`;
  }

  if (
    !isBack &&
    frontLogoAlwaysBlockedFromPrimaryDesignColor.has(kitDesignState.selectedDesign) &&
    isSameColor(color, kitDesignState.color)
  ) {
    return "El logo Starbade del frente no puede tener el mismo color que Color Diseño 1.";
  }

  if (
    !isBack &&
    designColorsMatch &&
    frontLogoBlockedWhenDesignColorsMatch.has(kitDesignState.selectedDesign) &&
    isSameColor(color, kitDesignState.color)
  ) {
    return "El logo Starbade del frente no puede tener el mismo color que el diseño cuando sus dos colores son iguales.";
  }

  if (
    isBack &&
    designColorsMatch &&
    backLogoBlockedWhenDesignColorsMatch.has(kitDesignState.selectedDesign) &&
    isSameColor(color, kitDesignState.color)
  ) {
    return "El logo Starbade de la espalda no puede tener el mismo color que el diseño cuando sus dos colores son iguales.";
  }

  if (
    !isBack &&
    !starbadeLogoState.strokeEnabled &&
    primaryDesignMatchesFront &&
    isSameColor(color, kitDesignState.color)
  ) {
    return "El logo Starbade del frente no puede tener el mismo color que el diseño aplicado sobre el frente.";
  }

  if (
    isBack &&
    !starbadeLogoState.backStrokeEnabled &&
    primaryDesignMatchesBack &&
    isSameColor(color, kitDesignState.color)
  ) {
    return "El logo Starbade de la espalda no puede tener el mismo color que el diseño aplicado sobre la espalda.";
  }

  return "";
}

function getDesignColorConflictMessage(color) {
  const rules = getCurrentSingleColorDesignRules();
  const hasSleeveConflictRule = doesCurrentDesignBlockSleeveDesignColorMatch();
  const hasTwoColorMaterialRule = getCurrentTwoColorDesignMaterialTargets().length > 0;

  if (!rules && !hasSleeveConflictRule && !hasTwoColorMaterialRule) return "";

  const materialConflicts = getDesignMaterialColorConflicts(color);

  if (materialConflicts.length) {
    return `El diseño no puede tener el mismo color que ${formatConflictList(materialConflicts)}.`;
  }

  if (
    !autoResolveStarbadeLogoColorConflicts &&
    rules &&
    !rules.frontLogoMatchesDesign &&
    isSameColor(color, starbadeLogoState.logoColor)
  ) {
    return "El diseño no puede tener el mismo color que el logo Starbade del frente.";
  }

  if (
    !autoResolveStarbadeLogoColorConflicts &&
    rules &&
    !rules.backLogoMatchesDesign &&
    isSameColor(color, starbadeLogoState.backLogoColor)
  ) {
    return "El diseño no puede tener el mismo color que el logo Starbade de la espalda.";
  }

  return "";
}

function getMaterialColorConflictMessage(materialKey, color) {
  const rules = getCurrentDesignRules();
  const isSleeveMaterial = (
    materialKey === "sleeves" ||
    materialKey === "sleevesLeft" ||
    materialKey === "sleevesRight"
  );

  const materialLabel = {
    front: "el frente",
    back: "la espalda",
    sleeves: "las mangas",
    sleevesLeft: "la manga",
    sleevesRight: "la manga"
  }[materialKey];

  if (!autoResolveStarbadeLogoColorConflicts && !rules) {
    if (
      materialKey === "front" &&
      isNoDesignSelected() &&
      isSameColor(color, starbadeLogoState.logoColor)
    ) {
      return "El frente no puede tener el mismo color que su logo Starbade.";
    }

    if (
      materialKey === "back" &&
      isNoDesignSelected() &&
      isSameColor(color, starbadeLogoState.backLogoColor)
    ) {
      return "La espalda no puede tener el mismo color que su logo Starbade.";
    }

    return "";
  }

  if (!rules) return "";

  if (
    getCurrentDesignColorsBlockedForMaterial(materialKey).some((designColor) => (
      isSameColor(color, designColor)
    ))
  ) {
    const verb = materialKey === "sleeves" ? "pueden" : "puede";

    return `${materialLabel[0].toUpperCase()}${materialLabel.slice(1)} no ${verb} tener el mismo color que el diseño aplicado.`;
  }

  if (
    isSleeveMaterial &&
    getCurrentSleeveBlockedDesignColors().some((designColor) => (
      isSameColor(color, designColor)
    ))
  ) {
    return "Las mangas no pueden tener el mismo color que el diseño aplicado.";
  }

  if (
    !isSleeveMaterial &&
    !(materialKey === "back" && canBackMatchCurrentDesignColor()) &&
    isCurrentDesignSingleColor() &&
    !isCurrentDesignSleeveOnly() &&
    isSameColor(color, kitDesignState.color)
  ) {
    const verb = materialKey === "sleeves" ? "pueden" : "puede";

    return `${materialLabel[0].toUpperCase()}${materialLabel.slice(1)} no ${verb} tener el mismo color que el diseño aplicado.`;
  }

  if (
    !autoResolveStarbadeLogoColorConflicts &&
    materialKey === "front" &&
    !rules.frontLogoMatchesMaterial &&
    isSameColor(color, starbadeLogoState.logoColor)
  ) {
    return "El frente no puede tener el mismo color que su logo Starbade para este diseño.";
  }

  if (
    !autoResolveStarbadeLogoColorConflicts &&
    materialKey === "back" &&
    !rules.backLogoMatchesMaterial &&
    isSameColor(color, starbadeLogoState.backLogoColor)
  ) {
    return "La espalda no puede tener el mismo color que su logo Starbade para este diseño.";
  }

  return "";
}

function findCompatiblePaletteColor(validateColor) {
  const candidates = [initialBlack, initialWhite, ...palette];

  return candidates.find((color, index) => (
    candidates.indexOf(color) === index && !validateColor(color)
  )) || initialWhite;
}

function getShortStarbadeLogoConflictMessage(color) {
  return isSameColor(color, kitMaterialState.shortColor)
    ? "El logo Starbade del short no puede tener el mismo color que el short."
    : "";
}

function reconcileShortStarbadeLogoColor() {
  if (!getShortStarbadeLogoConflictMessage(shortLogoState.starbadeLogoColor)) return;

  const nextColor = findCompatiblePaletteColor((candidate) => (
    getShortStarbadeLogoConflictMessage(candidate)
  ));

  shortLogoState.starbadeLogoColor = nextColor;
  setColorPreviewBackgrounds(colorTargets.shortStarbadeLogo.previews, nextColor);
  applyKitShortStarbadeLogoState();
}

function getTwoColorDesignMaterialConflicts(
  primaryColor = kitDesignState.color,
  secondaryColor = kitDesignState.secondaryColor
) {
  const conflicts = [];
  const targets = getCurrentTwoColorDesignMaterialTargets();

  if (!targets.length) return conflicts;

  if (
    targets.includes("front") &&
    isSameColor(primaryColor, kitMaterialState.frontColor) &&
    isSameColor(secondaryColor, kitMaterialState.frontColor)
  ) {
    conflicts.push("el frente");
  }

  if (
    targets.includes("back") &&
    isSameColor(primaryColor, kitMaterialState.backColor) &&
    isSameColor(secondaryColor, kitMaterialState.backColor)
  ) {
    conflicts.push("la espalda");
  }

  if (
    targets.includes("sleeves") &&
    getCurrentSleeveColors().some((sleeveColor) => (
      isSameColor(primaryColor, sleeveColor) &&
      isSameColor(secondaryColor, sleeveColor)
    ))
  ) {
    conflicts.push("las mangas");
  }

  return conflicts;
}

function reconcileTwoColorDesignMaterialPair(changedLayer, preferredFallbackColor) {
  if (!twoColorDesigns.has(kitDesignState.selectedDesign)) return false;
  if (!getTwoColorDesignMaterialConflicts().length) return false;

  const isPrimaryChanged = changedLayer === "primary";
  const otherStateKey = isPrimaryChanged ? "secondaryColor" : "color";
  const otherPreviewTarget = isPrimaryChanged ? "designSecondary" : "design";
  const candidates = [
    normalizeConfigurableModelColor(preferredFallbackColor),
    initialBlack,
    initialWhite,
    ...palette
  ];
  const nextOtherColor = candidates.find((candidate, index) => {
    if (!candidate || candidates.indexOf(candidate) !== index) return false;

    const nextPrimaryColor = isPrimaryChanged ? kitDesignState.color : candidate;
    const nextSecondaryColor = isPrimaryChanged ? candidate : kitDesignState.secondaryColor;

    return !getTwoColorDesignMaterialConflicts(nextPrimaryColor, nextSecondaryColor).length;
  }) || initialWhite;

  kitDesignState[otherStateKey] = nextOtherColor;
  setColorPreviewBackgrounds(colorTargets[otherPreviewTarget].previews, nextOtherColor);

  return true;
}

function setKitDesignLayerColor(layer, color) {
  color = normalizeConfigurableModelColor(color) || color;

  const isPrimary = layer === "primary";
  const targetStateKey = isPrimary ? "color" : "secondaryColor";
  const previousColor = kitDesignState[targetStateKey];

  kitDesignState[targetStateKey] = color;
  reconcileTwoColorDesignMaterialPair(layer, previousColor);
  applyKitDesignState();
  reconcileStarbadeLogoColorsForCurrentRules();
}

function getFillStrokePairConfig(pairKey) {
  const pairs = {
    frontStarbade: {
      getFillColor: () => starbadeLogoState.logoColor,
      setFillColor: (color) => { starbadeLogoState.logoColor = color; },
      getStrokeColor: () => starbadeLogoState.strokeColor,
      setStrokeColor: (color) => { starbadeLogoState.strokeColor = color; },
      fillPreviewTarget: "starbadeLogo",
      strokePreviewTarget: "starbadeStroke",
      applyFill: applyKitStarbadeLogoState,
      applyStroke: applyKitStarbadeStrokeState
    },
    backStarbade: {
      getFillColor: () => starbadeLogoState.backLogoColor,
      setFillColor: (color) => { starbadeLogoState.backLogoColor = color; },
      getStrokeColor: () => starbadeLogoState.backStrokeColor,
      setStrokeColor: (color) => { starbadeLogoState.backStrokeColor = color; },
      fillPreviewTarget: "backStarbadeLogo",
      strokePreviewTarget: "backStarbadeStroke",
      applyFill: applyKitBackStarbadeLogoState,
      applyStroke: applyKitBackStarbadeStrokeState
    },
    dorsalNumber: {
      getFillColor: () => dorsalNumberState.numberColor,
      setFillColor: (color) => { dorsalNumberState.numberColor = color; },
      getStrokeColor: () => dorsalNumberState.strokeColor,
      setStrokeColor: (color) => { dorsalNumberState.strokeColor = color; },
      fillPreviewTarget: "dorsalNumber",
      strokePreviewTarget: "dorsalNumberStroke",
      applyFill: applyBackDorsalNumberState,
      applyStroke: applyBackDorsalNumberStrokeState
    },
    dorsalName: {
      getFillColor: () => dorsalNumberState.nameColor,
      setFillColor: (color) => { dorsalNumberState.nameColor = color; },
      getStrokeColor: () => dorsalNumberState.nameStrokeColor,
      setStrokeColor: (color) => { dorsalNumberState.nameStrokeColor = color; },
      fillPreviewTarget: "dorsalName",
      strokePreviewTarget: "dorsalNameStroke",
      applyFill: applyBackDorsalNameState,
      applyStroke: applyBackDorsalNameStrokeState
    }
  };

  return pairs[pairKey] || null;
}

function swapFillStrokePairColors(pairKey, selectedPart, selectedColor) {
  const pair = getFillStrokePairConfig(pairKey);

  if (!pair) return false;

  const isFillSelected = selectedPart === "fill";
  const currentColor = isFillSelected
    ? pair.getFillColor()
    : pair.getStrokeColor();
  const pairedColor = isFillSelected
    ? pair.getStrokeColor()
    : pair.getFillColor();

  if (!isSameColor(selectedColor, pairedColor)) return false;

  const nextPairedColor = !isSameColor(currentColor, selectedColor)
    ? currentColor
    : findCompatiblePaletteColor((candidate) => (
      isSameColor(candidate, selectedColor)
    ));

  if (isFillSelected) {
    pair.setStrokeColor(nextPairedColor);
    syncStrokePreview(pair.strokePreviewTarget, nextPairedColor);
    pair.applyStroke();
  } else {
    pair.setFillColor(nextPairedColor);
    setColorPreviewBackgrounds(
      colorTargets[pair.fillPreviewTarget].previews,
      nextPairedColor
    );
    syncStrokePreview(pair.strokePreviewTarget);
    pair.applyFill();
  }

  return true;
}

function reconcileStarbadeLogoColorsForCurrentRules() {
  [
    {
      placement: "front",
      stateKey: "logoColor",
      colorTarget: "starbadeLogo",
      strokeColor: starbadeLogoState.strokeColor,
      apply: applyKitStarbadeLogoState
    },
    {
      placement: "back",
      stateKey: "backLogoColor",
      colorTarget: "backStarbadeLogo",
      strokeColor: starbadeLogoState.backStrokeColor,
      apply: applyKitBackStarbadeLogoState
    }
  ].forEach((config) => {
    const currentColor = starbadeLogoState[config.stateKey];
    const hasRuleConflict = getStarbadeLogoRuleConflictMessage(config.placement, currentColor);

    if (!hasRuleConflict) return;

    const nextColor = findCompatiblePaletteColor((candidate) => (
      getStarbadeLogoRuleConflictMessage(config.placement, candidate) ||
      isSameColor(candidate, config.strokeColor)
    ));

    starbadeLogoState[config.stateKey] = nextColor;
    setColorPreviewBackgrounds(colorTargets[config.colorTarget].previews, nextColor);
    syncStrokePreview(
      config.placement === "back" ? "backStarbadeStroke" : "starbadeStroke"
    );
    config.apply();
  });
}

function reconcileCurrentDesignColors() {
  const hasDesignRules = Boolean(getCurrentDesignRules());

  if (!hasDesignRules && !isNoDesignSelected()) return;

  if (hasDesignRules && getDesignColorConflictMessage(kitDesignState.color)) {
    kitDesignState.color = findCompatiblePaletteColor((candidate) => (
      getDesignColorConflictMessage(candidate)
    ));
    setColorPreviewBackgrounds(colorTargets.design.previews, kitDesignState.color);
    applyKitDesignState();
  }

  if (
    twoColorDesigns.has(kitDesignState.selectedDesign) &&
    getDesignColorConflictMessage(kitDesignState.secondaryColor)
  ) {
    kitDesignState.secondaryColor = findCompatiblePaletteColor((candidate) => (
      getDesignColorConflictMessage(candidate)
    ));
    setColorPreviewBackgrounds(
      colorTargets.designSecondary.previews,
      kitDesignState.secondaryColor
    );
    applyKitDesignState();
  }

  if (reconcileTwoColorDesignMaterialPair("secondary", kitDesignState.color)) {
    applyKitDesignState();
  }

  reconcileStarbadeLogoColorsForCurrentRules();
  reconcileShortStarbadeLogoColor();
}

function reconcileSleeveColorsForSplitState(nextSplitState) {
  if (!isCurrentDesignSingleColor()) return;
  if (isCurrentDesignSleeveOnly()) return;

  const sleeves = splitGroups.sleeves;
  const isDesignColor = (color) => isSameColor(color, kitDesignState.color);
  const safeFallback = findCompatiblePaletteColor((color) => isDesignColor(color));

  if (nextSplitState) {
    const fallback = !isDesignColor(sleeves.combinedColor)
      ? sleeves.combinedColor
      : safeFallback;

    if (isDesignColor(sleeves.leftColor)) sleeves.leftColor = fallback;
    if (isDesignColor(sleeves.rightColor)) sleeves.rightColor = fallback;
  } else if (isDesignColor(sleeves.combinedColor)) {
    sleeves.combinedColor = !isDesignColor(sleeves.leftColor)
      ? sleeves.leftColor
      : safeFallback;
  }

  syncSplitGroupPreviews("sleeves");
}

function syncSplitGroupPreviews(groupKey) {
  const group = splitGroups[groupKey];

  if (!group) return;

  setColorPreviewBackgrounds(group.mainPreviews, group.combinedColor);
  setColorPreviewBackgrounds(group.leftPreviews, group.leftColor);
  setColorPreviewBackgrounds(group.rightPreviews, group.rightColor);
}

function toggleSplitGroup(groupKey) {
  const group = splitGroups[groupKey];

  if (!group) return;
  if (groupKey === "linePunos" && !linePunosEnabled) return;

  const nextState = !group.containers[0].classList.contains("is-split");

  if (groupKey === "sleeves") {
    reconcileSleeveColorsForSplitState(nextState);
  }

  group.containers.forEach((container) => {
    container.classList.toggle("is-split", nextState);
  });

  group.hasModelColor = true;
  applySplitGroupMaterialState(groupKey);

  if (groupKey === "sleeves") {
    reconcileCurrentDesignColors();
  }
}

Object.keys(splitGroups).forEach(syncSplitGroupPreviews);

function isSplitGroupActive(groupKey) {
  const group = splitGroups[groupKey];

  if (!group) return false;

  return group.containers.some((container) => container?.classList.contains("is-split"));
}

function applySplitGroupMaterialState(groupKey) {
  const group = splitGroups[groupKey];
  const materialGroup = splitMaterialGroups[groupKey];

  if (!group) return;

  if (groupKey === "linePunos") {
    applyKitCuffLineState();
    return;
  }

  if (!materialGroup) return;

  if (isSplitGroupActive(groupKey)) {
    const leftApplied = applyKitMaterialGroupsColor(materialGroup.left, group.leftColor, false);
    const rightApplied = applyKitMaterialGroupsColor(materialGroup.right, group.rightColor, false);

    if ((leftApplied || rightApplied) && window.starbadeViewer3D) {
      window.starbadeViewer3D.render();
    }

    return;
  }

  applyKitMaterialGroupsColor(materialGroup.combined, group.combinedColor);
}

function applyDirtySplitGroupMaterialStates() {
  Object.entries(splitGroups).forEach(([groupKey, group]) => {
    if (group.hasModelColor) {
      applySplitGroupMaterialState(groupKey);
    }
  });
}

// Cada swatch tiene dos colores:
// swatchColor: color que ve el usuario en el cuadrito del popup.
// modelColor: color real que se aplica sobre el modelo 3D.
const paletteSwatches = [
  {
    swatchColor: "#5b0000",
    modelColor: "#5b0000"
  },
  {
    swatchColor: "#8b0000",
    modelColor: "#8b0000"
  },
  {
    swatchColor: "#b30000",
    modelColor: "#b30000"
  },
  {
    swatchColor: "#d91c1c",
    modelColor: "#d91c1c"
  },
  {
    swatchColor: "#ff4d4d",
    modelColor: "#ff4d4d"
  },

  {
    swatchColor: "#7a3200",
    modelColor: "#7a3200"
  },
  {
    swatchColor: "#a84300",
    modelColor: "#a84300"
  },
  {
    swatchColor: "#d96400",
    modelColor: "#d96400"
  },
  {
    swatchColor: "#ff8c1a",
    modelColor: "#ff8c1a"
  },
  {
    swatchColor: "#ffb366",
    modelColor: "#ffb366"
  },

  {
    swatchColor: "#665100",
    modelColor: "#665100"
  },
  {
    swatchColor: "#997a00",
    modelColor: "#997a00"
  },
  {
    swatchColor: "#ccaa00",
    modelColor: "#ccaa00"
  },
  {
    swatchColor: "#ffd11a",
    modelColor: "#ffd11a"
  },
  {
    swatchColor: "#ffe680",
    modelColor: "#ffe680"
  },

  {
    swatchColor: "#004d1a",
    modelColor: "#004d1a"
  },
  {
    swatchColor: "#007a29",
    modelColor: "#007a29"
  },
  {
    swatchColor: "#00a83a",
    modelColor: "#00a83a"
  },
  {
    swatchColor: "#1ad15c",
    modelColor: "#1ad15c"
  },
  {
    swatchColor: "#80ffae",
    modelColor: "#80ffae"
  },

  {
    swatchColor: "#005566",
    modelColor: "#005566"
  },
  {
    swatchColor: "#007a99",
    modelColor: "#007a99"
  },
  {
    swatchColor: "#00aacc",
    modelColor: "#00aacc"
  },
  {
    swatchColor: "#33d6ff",
    modelColor: "#33d6ff"
  },
  {
    swatchColor: "#99f0ff",
    modelColor: "#99f0ff"
  },

  {
    swatchColor: "#002966",
    modelColor: "#002966"
  },
  {
    swatchColor: "#003d99",
    modelColor: "#003d99"
  },
  {
    swatchColor: "#0052cc",
    modelColor: "#0052cc"
  },
  {
    swatchColor: "#3375ff",
    modelColor: "#3375ff"
  },
  {
    swatchColor: "#99b8ff",
    modelColor: "#99b8ff"
  },

  {
    swatchColor: "#2d004d",
    modelColor: "#2d004d"
  },
  {
    swatchColor: "#4b0082",
    modelColor: "#4b0082"
  },
  {
    swatchColor: "#6a00b3",
    modelColor: "#6a00b3"
  },
  {
    swatchColor: "#9933ff",
    modelColor: "#9933ff"
  },
  {
    swatchColor: "#d1a3ff",
    modelColor: "#d1a3ff"
  },

  {
    swatchColor: "#660033",
    modelColor: "#660033"
  },
  {
    swatchColor: "#99004d",
    modelColor: "#99004d"
  },
  {
    swatchColor: "#cc0066",
    modelColor: "#cc0066"
  },
  {
    swatchColor: "#ff3385",
    modelColor: "#ff3385"
  },
  {
    swatchColor: "#ff99c2",
    modelColor: "#ff99c2"
  },

  {
    swatchColor: "#ffffff",
    modelColor: "#ffffff"
  },
  {
    swatchColor: "#f2f2f2",
    modelColor: "#f5f5f5"
  },
  {
    swatchColor: "#d9d9d9",
    modelColor: "#e3e3e3"
  },
  {
    swatchColor: "#bfbfbf",
    modelColor: "#cfcfcf"
  },
  {
    swatchColor: "#8c8c8c",
    modelColor: "#a9a9a9"
  },

  {
    swatchColor: "#5a5a5a",
    modelColor: "#838383"
  },
  {
    swatchColor: "#404040",
    modelColor: "#707070"
  },
  {
    swatchColor: "#262626",
    modelColor: "#5c5c5c"
  },
  {
    swatchColor: "#111111",
    modelColor: "#4d4d4d"
  },
  {
    swatchColor: "#000000",
    modelColor: "#404040"
  }
];

const mediasPaletteSwatches = [
  {
    swatchColor: "#000000",
    modelColor: "#404040"
  },
  {
    swatchColor: "#ffffff",
    modelColor: "#ffffff"
  },
  {
    swatchColor: "#d91c1c",
    modelColor: "#d91c1c"
  },
  {
    swatchColor: "#0052cc",
    modelColor: "#0052cc"
  },
  {
    swatchColor: "#002966",
    modelColor: "#002966"
  },
  {
    swatchColor: "#007a29",
    modelColor: "#007a29"
  }
];

const paletteSwatchFamilyLabels = [
  "Rojo",
  "Naranja",
  "Amarillo",
  "Verde",
  "Celeste",
  "Azul",
  "Violeta",
  "Rosa"
];

paletteSwatchFamilyLabels.forEach((familyLabel, familyIndex) => {
  const familyStartIndex = familyIndex * 5;

  for (let shadeIndex = 0; shadeIndex < 5; shadeIndex += 1) {
    const swatch = paletteSwatches[familyStartIndex + shadeIndex];

    if (swatch) {
      swatch.label = `${familyLabel} ${4 - shadeIndex}`;
    }
  }
});

paletteSwatches.slice(40, 45).forEach((swatch, index) => {
  swatch.label = `Blanco ${index + 1}`;
});

paletteSwatches.slice(45, 50).forEach((swatch, index) => {
  swatch.label = `Negro ${5 - index}`;
});

function swatchesHaveSameColors(firstSwatch, secondSwatch) {
  return (
    normalizeShareColor(firstSwatch?.swatchColor) === normalizeShareColor(secondSwatch?.swatchColor) &&
    normalizeShareColor(firstSwatch?.modelColor) === normalizeShareColor(secondSwatch?.modelColor)
  );
}

mediasPaletteSwatches.forEach((swatch) => {
  const matchingPaletteSwatch = paletteSwatches.find((paletteSwatch) => (
    swatchesHaveSameColors(swatch, paletteSwatch)
  ));

  swatch.label = matchingPaletteSwatch?.label || "Color de Media";
});

const palette = paletteSwatches.map((swatch) => swatch.modelColor);
const mediasPalette = mediasPaletteSwatches.map((swatch) => swatch.modelColor);

const popupThemes = {
  default: {
    title: "Colores Starbade",
    info: "Paleta recomendada para que la vista previa se acerque lo más posible al color real.",
    colors: paletteSwatches,
    recentLimit: 10
  },
  medias: {
    title: "Colores de Medias",
    info: "Estos son nuestros colores de medias disponibles.",
    colors: mediasPaletteSwatches,
    recentLimit: 6
  }
};

const recentColorsByMode = {
  default: [],
  medias: []
};

let activeColorTarget = "front";
let activePopupMode = "default";

let panelHombrosEnabled = false;
let borderPanelHombrosEnabled = false;

let panelLateralesEnabled = false;
let borderPanelLateralesEnabled = false;

let lineCuelloEnabled = false;
let linePunosEnabled = false;

let lineFinaEnabled = false;
let lineGruesaEnabled = false;
let lineInferiorEnabled = false;

function getSwatchDisplayColor(swatch) {
  return typeof swatch === "string" ? swatch : swatch?.swatchColor;
}

function getSwatchModelColor(swatch) {
  return typeof swatch === "string" ? swatch : (swatch?.modelColor || swatch?.swatchColor);
}

function getSwatchLabel(swatch) {
  return typeof swatch === "string" ? swatch : (swatch?.label || getSwatchDisplayColor(swatch));
}

function getRecentSwatchEntry(swatch) {
  return {
    swatchColor: getSwatchDisplayColor(swatch),
    modelColor: getSwatchModelColor(swatch),
    label: getSwatchLabel(swatch)
  };
}

function getSwatchKey(swatch) {
  return [
    normalizeShareColor(getSwatchDisplayColor(swatch)),
    normalizeShareColor(getSwatchModelColor(swatch))
  ].join("|");
}

function addRecentSwatch(swatch) {
  const swatchKey = getSwatchKey(swatch);

  recentColorsByMode[activePopupMode] = [
    getRecentSwatchEntry(swatch),
    ...recentColorsByMode[activePopupMode].filter((item) => getSwatchKey(item) !== swatchKey)
  ].slice(0, popupThemes[activePopupMode].recentLimit);
}

function getPreviewColorForModelColor(color) {
  const normalizedColor = normalizeConfigurableModelColor(color);

  if (!normalizedColor) return color;

  let swatches = [];

  try {
    swatches = [
      ...paletteSwatches,
      ...mediasPaletteSwatches
    ];
  } catch (error) {
    return color;
  }

  const matchingSwatch = swatches.find((swatch) => (
    normalizeShareColor(swatch.modelColor) === normalizedColor
  ));

  return matchingSwatch?.swatchColor || color;
}

function setColorPreviewBackgrounds(previews, modelColor, previewColor = getPreviewColorForModelColor(modelColor)) {
  setPreviewBackgrounds(previews, previewColor);
}

function syncBorderPanelHombrosToggle() {

  const panelAvailable = panelHombrosEnabled;
  const borderAvailable = panelHombrosEnabled && borderPanelHombrosEnabled;

  [borderPanelHombrosBtn, mobileBorderPanelHombrosBtn].forEach((button) => {

    if (!button) return;

    button.disabled = !borderAvailable;
    button.classList.toggle("is-disabled", !borderAvailable);

  });

  [borderPanelHombrosToggle, mobileBorderPanelHombrosToggle].forEach((toggle) => {

    if (!toggle) return;

    toggle.disabled = !panelAvailable;

    toggle.classList.toggle("is-active", borderAvailable);

    toggle.setAttribute("aria-pressed", String(borderAvailable));

  });

  if (!panelAvailable) {
    borderPanelHombrosEnabled = false;
  }

}

function syncPanelHombrosToggle() {
  [panelHombrosToggle, mobilePanelHombrosToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", panelHombrosEnabled);
    toggle.setAttribute("aria-pressed", String(panelHombrosEnabled));
  });

  [panelHombrosBtn, mobilePanelHombrosBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !panelHombrosEnabled;
    button.classList.toggle("is-disabled", !panelHombrosEnabled);
  })

  if (!panelHombrosEnabled) {
    borderPanelHombrosEnabled = false;
  }

  syncBorderPanelHombrosToggle();
}

function syncPanelLateralesToggle({ openWarning = true } = {}) {
  [panelLateralesToggle, mobilePanelLateralesToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", panelLateralesEnabled);
    toggle.setAttribute("aria-pressed", String(panelLateralesEnabled));
  });

  [panelLateralesBtn, mobilePanelLateralesBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !panelLateralesEnabled;
    button.classList.toggle("is-disabled", !panelLateralesEnabled);
  });

  if (!panelLateralesEnabled) {
    borderPanelLateralesEnabled = false;
  }

  syncBorderPanelLateralesToggle();
  syncViewerWarningIcon({ openPanel: openWarning && !panelLateralesEnabled });
}

function syncLineCuelloToggle() {
  [lineCuelloToggle, mobileLineCuelloToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", lineCuelloEnabled);
    toggle.setAttribute("aria-pressed", String(lineCuelloEnabled));
  });

  [lineCuelloBtn, mobileLineCuelloBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !lineCuelloEnabled;
    button.classList.toggle("is-disabled", !lineCuelloEnabled);
  });
}

function syncLinePunosToggle() {
  [linePunosToggle, mobileLinePunosToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", linePunosEnabled);
    toggle.setAttribute("aria-pressed", String(linePunosEnabled));
  });

  [
    linePunosBtn,
    mobileLinePunosBtn,
    linePunosLeftBtn,
    mobileLinePunosLeftBtn,
    linePunosRightBtn,
    mobileLinePunosRightBtn
  ].forEach((button) => {
    if (!button) return;

    button.disabled = !linePunosEnabled;
    button.classList.toggle("is-disabled", !linePunosEnabled);
  });

  splitGroups.linePunos.toggleButtons.forEach((button) => {
    if (!button) return;

    button.disabled = !linePunosEnabled;
  });
}

function syncShortLinesToggle() {
  [lineFinaToggle, mobileLineFinaToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", lineFinaEnabled);
    toggle.setAttribute("aria-pressed", String(lineFinaEnabled));
  });

  [lineFinaBtn, mobileLineFinaBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !lineFinaEnabled;
    button.classList.toggle("is-disabled", !lineFinaEnabled);
  });

  [lineGruesaToggle, mobileLineGruesaToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", lineGruesaEnabled);
    toggle.setAttribute("aria-pressed", String(lineGruesaEnabled));
  });

  [lineGruesaBtn, mobileLineGruesaBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !lineGruesaEnabled;
    button.classList.toggle("is-disabled", !lineGruesaEnabled);
  });

  [lineInferiorToggle, mobileLineInferiorToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", lineInferiorEnabled);
    toggle.setAttribute("aria-pressed", String(lineInferiorEnabled));
  });

  [lineInferiorBtn, mobileLineInferiorBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !lineInferiorEnabled;
    button.classList.toggle("is-disabled", !lineInferiorEnabled);
  });
}

function syncStarbadeStrokeToggle() {
  const isEnabled = starbadeLogoState.strokeEnabled;

  [starbadeStrokeToggle, mobileStarbadeStrokeToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", isEnabled);
    toggle.setAttribute("aria-pressed", String(isEnabled));
  });

  [starbadeStrokeColorBtn, mobileStarbadeStrokeColorBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !isEnabled;
    button.classList.toggle("is-disabled", !isEnabled);
  });
}

function syncBackStarbadeStrokeToggle() {
  const isEnabled = starbadeLogoState.backStrokeEnabled;

  [backStarbadeStrokeToggle, mobileBackStarbadeStrokeToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", isEnabled);
    toggle.setAttribute("aria-pressed", String(isEnabled));
  });

  [backStarbadeStrokeColorBtn, mobileBackStarbadeStrokeColorBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !isEnabled;
    button.classList.toggle("is-disabled", !isEnabled);
  });
}

let starbadeStrokeRulePopup = null;

function closeStarbadeStrokeRulePopup() {
  starbadeStrokeRulePopup?.classList.remove("active");
}

function getStarbadeStrokeRulePopup() {
  if (starbadeStrokeRulePopup) return starbadeStrokeRulePopup;

  starbadeStrokeRulePopup = document.createElement("div");
  starbadeStrokeRulePopup.className = "starbade-stroke-rule-popup";
  starbadeStrokeRulePopup.textContent = "No aplica para este diseño.";
  document.body.appendChild(starbadeStrokeRulePopup);

  starbadeStrokeRulePopup.addEventListener("click", (event) => {
    event.stopPropagation();
    closeStarbadeStrokeRulePopup();
  });

  return starbadeStrokeRulePopup;
}

function showStarbadeStrokeRulePopup(toggle, message = "No aplica para este dise\u00f1o.") {
  const popup = getStarbadeStrokeRulePopup();
  const rect = toggle.getBoundingClientRect();
  const spacing = 8;

  popup.textContent = message;
  popup.classList.add("active");

  const popupWidth = popup.offsetWidth || 190;
  const popupHeight = popup.offsetHeight || 38;
  const placeOnLeft = rect.right + spacing + popupWidth > window.innerWidth - 8;
  const left = placeOnLeft
    ? Math.max(8, rect.left - spacing - popupWidth)
    : Math.min(window.innerWidth - popupWidth - 8, rect.right + spacing);
  const top = Math.min(
    window.innerHeight - popupHeight - 8,
    Math.max(8, rect.top + (rect.height - popupHeight) / 2)
  );

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

const dorsalNumberStrokeRequiresNumberMessage =
  "Primero ten\u00e9s que activar el n\u00famero para poder usar su trazo.";
const dorsalNameStrokeRequiresNameMessage =
  "Primero ten\u00e9s que activar el nombre para poder usar su trazo.";

document.addEventListener("click", (event) => {
  if (!starbadeStrokeRulePopup?.classList.contains("active")) return;
  if (starbadeStrokeRulePopup.contains(event.target)) return;

  closeStarbadeStrokeRulePopup();
});

window.addEventListener("resize", closeStarbadeStrokeRulePopup);

let colorConflictRulePopup = null;

function closeColorConflictRulePopup() {
  colorConflictRulePopup?.classList.remove("active");
}

function getColorConflictRulePopup() {
  if (colorConflictRulePopup) return colorConflictRulePopup;

  colorConflictRulePopup = document.createElement("div");
  colorConflictRulePopup.className = "color-conflict-rule-popup";
  document.body.appendChild(colorConflictRulePopup);

  colorConflictRulePopup.addEventListener("click", (event) => {
    event.stopPropagation();
    closeColorConflictRulePopup();
  });

  return colorConflictRulePopup;
}

function getVisibleTargetButton(target) {
  return target?.buttons?.find((button) => {
    if (!button) return false;

    const rect = button.getBoundingClientRect();

    return rect.width > 0 && rect.height > 0;
  }) || null;
}

function showColorConflictRulePopup(message) {
  const popup = getColorConflictRulePopup();
  const target = colorTargets[activeColorTarget];
  const anchor = getVisibleTargetButton(target) || colorPopup;
  const rect = anchor.getBoundingClientRect();
  const spacing = 8;

  popup.textContent = message;
  popup.classList.add("active");

  const popupWidth = popup.offsetWidth || 230;
  const popupHeight = popup.offsetHeight || 38;
  const placeOnLeft = rect.right + spacing + popupWidth > window.innerWidth - 8;
  const left = placeOnLeft
    ? Math.max(8, rect.left - spacing - popupWidth)
    : Math.min(window.innerWidth - popupWidth - 8, rect.right + spacing);
  const top = Math.min(
    window.innerHeight - popupHeight - 8,
    Math.max(8, rect.top + (rect.height - popupHeight) / 2)
  );

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

document.addEventListener("click", (event) => {
  if (!colorConflictRulePopup?.classList.contains("active")) return;
  if (colorConflictRulePopup.contains(event.target)) return;

  closeColorConflictRulePopup();
});

window.addEventListener("resize", closeColorConflictRulePopup);

function setupDisabledInfoPopup(controls, shouldShow, showPopup) {
  const row = controls.find(Boolean)?.closest(".number-option-row, .logo-trace-row");
  if (!row) return;

  row.addEventListener("click", (event) => {
    if (!shouldShow()) return;

    event.stopPropagation();
    showPopup(controls.find(Boolean) || row);
  });
}

let lapelRulePopup = null;

function closeLapelRulePopup() {
  lapelRulePopup?.classList.remove("active");
}

function getLapelRulePopup() {
  if (lapelRulePopup) return lapelRulePopup;

  lapelRulePopup = document.createElement("div");
  lapelRulePopup.className = "lapel-rule-popup";
  lapelRulePopup.textContent = "Disponible solo en moldes con cuello polo.";
  document.body.appendChild(lapelRulePopup);

  lapelRulePopup.addEventListener("click", (event) => {
    event.stopPropagation();
    closeLapelRulePopup();
  });

  return lapelRulePopup;
}

function showLapelRulePopup(anchor) {
  const popup = getLapelRulePopup();
  const rect = anchor.getBoundingClientRect();
  const spacing = 8;

  popup.classList.add("active");

  const popupWidth = popup.offsetWidth || 230;
  const popupHeight = popup.offsetHeight || 38;
  const placeOnLeft = rect.right + spacing + popupWidth > window.innerWidth - 8;
  const left = placeOnLeft
    ? Math.max(8, rect.left - spacing - popupWidth)
    : Math.min(window.innerWidth - popupWidth - 8, rect.right + spacing);
  const top = Math.min(
    window.innerHeight - popupHeight - 8,
    Math.max(8, rect.top + (rect.height - popupHeight) / 2)
  );

  popup.style.left = `${left}px`;
  popup.style.top = `${top}px`;
}

document.addEventListener("click", (event) => {
  if (!lapelRulePopup?.classList.contains("active")) return;
  if (lapelRulePopup.contains(event.target)) return;

  closeLapelRulePopup();
});

window.addEventListener("resize", closeLapelRulePopup);

function syncDorsalNumberToggles() {
  const numberEnabled = dorsalNumberState.numberEnabled;
  const strokeEnabled = numberEnabled && dorsalNumberState.strokeEnabled;

  const nameEnabled = dorsalNumberState.nameEnabled;
  const nameStrokeEnabled = nameEnabled && dorsalNumberState.nameStrokeEnabled;

  [dorsalNumberToggle, mobileDorsalNumberToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", numberEnabled);
    toggle.setAttribute("aria-pressed", String(numberEnabled));
  });

  [dorsalNumberColorBtn, mobileDorsalNumberColorBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !numberEnabled;
    button.classList.toggle("is-disabled", !numberEnabled);
  });

  [dorsalNumberStrokeToggle, mobileDorsalNumberStrokeToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.disabled = !numberEnabled;
    toggle.classList.toggle("is-informative-disabled", !numberEnabled);
    toggle.classList.toggle("is-active", strokeEnabled);
    toggle.setAttribute("aria-pressed", String(strokeEnabled));
  });

  [dorsalNumberStrokeColorBtn, mobileDorsalNumberStrokeColorBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !strokeEnabled;
    button.classList.toggle("is-disabled", !strokeEnabled);
    button.classList.toggle("is-informative-disabled", !numberEnabled);
  });

  [dorsalNameToggle, mobileDorsalNameToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", nameEnabled);
    toggle.setAttribute("aria-pressed", String(nameEnabled));
  });

  [dorsalNameColorBtn, mobileDorsalNameColorBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !nameEnabled;
    button.classList.toggle("is-disabled", !nameEnabled);
  });

  [dorsalNameStrokeToggle, mobileDorsalNameStrokeToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.disabled = !nameEnabled;
    toggle.classList.toggle("is-informative-disabled", !nameEnabled);
    toggle.classList.toggle("is-active", nameStrokeEnabled);
    toggle.setAttribute("aria-pressed", String(nameStrokeEnabled));
  });

  [dorsalNameStrokeColorBtn, mobileDorsalNameStrokeColorBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !nameStrokeEnabled;
    button.classList.toggle("is-disabled", !nameStrokeEnabled);
    button.classList.toggle("is-informative-disabled", !nameEnabled);
  });

  if (!numberEnabled) {
    dorsalNumberState.strokeEnabled = false;
  }

  if (!nameEnabled) {
    dorsalNumberState.nameStrokeEnabled = false;
  }
}

function syncShortLogoToggles() {
  const shieldAvailable = Boolean(visualAssetState.shield.file);
  const shieldEnabled = shieldAvailable && shortLogoState.shieldEnabled;
  const shieldIcon = visualAssetState.shield.previewUrl || defaultLogoIcon;
  const shieldIconIsUserUploadPreview = Boolean(visualAssetState.shield.previewUrl);
  const numberEnabled = shortLogoState.numberEnabled;

  if (!shieldAvailable) {
    shortLogoState.shieldEnabled = false;
  }

  [shortShieldButtonIcon, mobileShortShieldButtonIcon].forEach((icon) => {
    if (!icon) return;

    icon.src = shieldIcon;
    icon.classList.toggle("is-user-upload-preview", shieldIconIsUserUploadPreview);
  });

  [shortShieldToggle, mobileShortShieldToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.disabled = !shieldAvailable;
    toggle.classList.toggle("is-informative-disabled", !shieldAvailable);
    toggle.classList.toggle("is-active", shieldEnabled);
    toggle.setAttribute("aria-pressed", String(shieldEnabled));
  });

  [shortShieldBtn, mobileShortShieldBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !shieldAvailable;
    button.classList.toggle("is-disabled", !shieldEnabled);
    button.classList.toggle("is-informative-disabled", !shieldAvailable);
  });

  [shortNumberToggle, mobileShortNumberToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.classList.toggle("is-active", numberEnabled);
    toggle.setAttribute("aria-pressed", String(numberEnabled));
  });

  [shortNumberColorBtn, mobileShortNumberColorBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !numberEnabled;
    button.classList.toggle("is-disabled", !numberEnabled);
  });
}

function syncBorderPanelLateralesToggle() {
  const panelAvailable = panelLateralesEnabled;
  const borderAvailable = panelLateralesEnabled && borderPanelLateralesEnabled;

  [borderPanelLateralesBtn, mobileBorderPanelLateralesBtn].forEach((button) => {
    if (!button) return;

    button.disabled = !borderAvailable;
    button.classList.toggle("is-disabled", !borderAvailable);
  });

  [borderPanelLateralesToggle, mobileBorderPanelLateralesToggle].forEach((toggle) => {
    if (!toggle) return;

    toggle.disabled = !panelAvailable;

    toggle.classList.toggle("is-active", borderAvailable);
    toggle.setAttribute("aria-pressed", String(borderAvailable));
  });

  if (!panelAvailable) {
    borderPanelLateralesEnabled = false;
  }
}

function renderColorGrid() {
  const theme = popupThemes[activePopupMode];

  colorGrid.innerHTML = "";

  theme.colors.forEach((colorSwatch) => {
    const displayColor = getSwatchDisplayColor(colorSwatch);
    const modelColor = getSwatchModelColor(colorSwatch);
    const swatchLabel = getSwatchLabel(colorSwatch);
    const swatch = document.createElement("button");

    swatch.classList.add("color-swatch");
    swatch.type = "button";
    swatch.style.background = displayColor;
    swatch.title = swatchLabel;
    swatch.setAttribute("aria-label", swatchLabel);

    swatch.addEventListener("click", (event) => {
      if (!applyColorToTarget(modelColor, displayColor)) {
        event.stopPropagation();
        return;
      }

      addRecentSwatch(colorSwatch);

      renderRecentColors();
      closePopup();
    });

    colorGrid.appendChild(swatch);
  });
}

function renderRecentColors() {
  recentColors.innerHTML = "";

  recentColorsByMode[activePopupMode].forEach((colorSwatch) => {
    const displayColor = getSwatchDisplayColor(colorSwatch);
    const modelColor = getSwatchModelColor(colorSwatch);
    const swatchLabel = getSwatchLabel(colorSwatch);
    const recentBtn = document.createElement("button");

    recentBtn.classList.add("recent-color");
    recentBtn.type = "button";
    recentBtn.style.background = displayColor;
    recentBtn.title = swatchLabel;
    recentBtn.setAttribute("aria-label", `Color reciente ${swatchLabel}`);

    recentBtn.addEventListener("click", (event) => {
      if (!applyColorToTarget(modelColor, displayColor)) {
        event.stopPropagation();
        return;
      }

      addRecentSwatch(colorSwatch);

      renderRecentColors();
      closePopup();
    });

    recentColors.appendChild(recentBtn);
  });
}

function syncPopupTheme() {
  const theme = popupThemes[activePopupMode];

  colorPopupHeaderText.textContent = theme.title;
  colorPopupInfo.textContent = theme.info;
  colorPopup.classList.toggle("is-medias", activePopupMode === "medias");

  renderColorGrid();
  renderRecentColors();
}

function openColorPopup(targetKey) {
  activeColorTarget = targetKey;
  activePopupMode = targetKey === "medias" ? "medias" : "default";

  closeInfoPopup();
  syncPopupTheme();

  if (colorPopup.classList.contains("active")) {
    colorPopup.classList.remove("target-switch");

    void colorPopup.offsetWidth;

    colorPopup.classList.add("target-switch");
    return;
  }

  colorPopup.classList.add("active");
  colorPopup.classList.remove("closing");
}

function closePopup() {
  closeInfoPopup();

  colorPopup.classList.add("closing");

  setTimeout(() => {
    colorPopup.classList.remove("active");
    colorPopup.classList.remove("closing");
  }, 180);
}

function openInfoPopup() {
  colorPopupInfo.classList.add("active");
}

function closeInfoPopup() {
  colorPopupInfo.classList.remove("active");
}

function openDesignPanel() {
  designOverlay.classList.add("active");
  designPanel.classList.add("active");

  document.body.style.overflow = "hidden";
}

function openMoldPanel() {
  moldOverlay.classList.add("active");
  moldPanel.classList.add("active");

  document.body.style.overflow = "hidden";
}

function openViewerWarningPanel() {
  if (viewerWarningBtn?.hidden) return;

  viewerWarningOverlay?.classList.add("active");
  viewerWarningPanel?.classList.add("active");

  document.body.style.overflow = "hidden";
}

function openSaveDesignPanel() {
  saveDesignOverlay?.classList.add("active");
  saveDesignPanel?.classList.add("active");

  document.body.style.overflow = "hidden";
}

function isQuoteFieldVisible(input) {
  if (!input) return false;

  const styles = window.getComputedStyle(input);

  return styles.display !== "none" && styles.visibility !== "hidden" && input.getClientRects().length > 0;
}

function getActiveQuoteInput(desktopInput, mobileInput) {
  return isQuoteFieldVisible(mobileInput) ? mobileInput : desktopInput;
}

function setQuoteInputError(input, hasError) {
  if (!input) return;

  input.classList.toggle("quote-field-error", hasError);
  input.closest(".quote-field")?.classList.toggle("has-error", hasError);
}

function setQuoteSizeError(hasError) {
  quoteSizeButtons.forEach((button) => {
    button.classList.toggle("quote-field-error", hasError);
  });

  document.querySelectorAll(".quote-choice-row").forEach((row) => {
    row.closest(".quote-field")?.classList.toggle("has-error", hasError);
  });
}

function validateQuoteForm() {
  const activeNameInput = getActiveQuoteInput(quoteNameInput, mobileQuoteNameInput);
  const activeTeamInput = getActiveQuoteInput(quoteTeamInput, mobileQuoteTeamInput);
  const missingName = !activeNameInput?.value?.trim();
  const missingTeam = !activeTeamInput?.value?.trim();
  const missingSize = quoteSizeState.size === 0;

  setQuoteInputError(activeNameInput, missingName);
  setQuoteInputError(activeTeamInput, missingTeam);
  setQuoteSizeError(missingSize);

  return !missingName && !missingTeam && !missingSize;
}

function getQuoteSizeMessagePart() {
  const needsAdult = quoteSizeState.has("adulto");
  const needsChild = quoteSizeState.has("nino");

  if (needsAdult && needsChild) return "talles de adulto y niño";
  if (needsAdult) return "talles de adulto";
  if (needsChild) return "talles de niño";

  return "talles";
}

function buildQuoteWhatsappMessage(designImageUrl = "") {
  const activeNameInput = getActiveQuoteInput(quoteNameInput, mobileQuoteNameInput);
  const activeTeamInput = getActiveQuoteInput(quoteTeamInput, mobileQuoteTeamInput);
  const customerName = activeNameInput?.value?.trim() || "";
  const teamName = activeTeamInput?.value?.trim() || "";
  const sizeText = getQuoteSizeMessagePart();
  const message = `Hola! Mi nombre es ${customerName}. Queria pedir una cotizacion para el diseño que hice en el configurador 3D de Starbade. Mi equipo se llama ${teamName}. Necesito ${sizeText}`;

  return designImageUrl
    ? `${message}\n\nLink del diseño: ${designImageUrl}`
    : message;
}

function buildQuoteEmailMessage(designImageUrl = "") {
  const activeNameInput = getActiveQuoteInput(quoteNameInput, mobileQuoteNameInput);
  const activeTeamInput = getActiveQuoteInput(quoteTeamInput, mobileQuoteTeamInput);
  const customerName = activeNameInput?.value?.trim() || "";
  const teamName = activeTeamInput?.value?.trim() || "";
  const sizeText = getQuoteSizeMessagePart();
  const messageLines = [
    "Hola,",
    "",
    `Mi nombre es ${customerName} y queria solicitar una cotizacion para el diseño que realice en el configurador 3D de Starbade.`,
    "",
    `El equipo se llama ${teamName} y necesito ${sizeText}.`
  ];

  if (designImageUrl) {
    messageLines.push("", `Link del diseño: ${designImageUrl}`);
  }

  messageLines.push(
    "",
    "Quedo atento/a a la información que necesiten para avanzar.",
    "",
    "Muchas gracias."
  );

  return messageLines.join("\n");
}

function getQuoteTeamForMessage() {
  const activeTeamInput = getActiveQuoteInput(quoteTeamInput, mobileQuoteTeamInput);

  return activeTeamInput?.value?.trim() || "";
}

function buildQuoteWhatsappUrl(designImageUrl = "") {
  const message = encodeURIComponent(buildQuoteWhatsappMessage(designImageUrl));

  return `https://wa.me/59894366118?text=${message}`;
}

function buildQuoteEmailUrl(designImageUrl = "") {
  const teamName = getQuoteTeamForMessage();
  const subject = encodeURIComponent(`Cotización de Diseño - ${teamName}`);
  const body = encodeURIComponent(buildQuoteEmailMessage(designImageUrl));

  return `mailto:starbadeuy@hotmail.com?subject=${subject}&body=${body}`;
}

function updateQuoteWhatsappLink(designImageUrl = "") {
  if (!quoteWhatsappBtn) return;

  quoteWhatsappBtn.href = buildQuoteWhatsappUrl(designImageUrl);
}

function updateQuoteEmailLink(designImageUrl = "") {
  if (!quoteEmailBtn) return;

  quoteEmailBtn.href = buildQuoteEmailUrl(designImageUrl);
}

function updateQuoteContactLinks(designImageUrl = "") {
  updateQuoteWhatsappLink(designImageUrl);
  updateQuoteEmailLink(designImageUrl);
}

function showQuoteUploadError(message) {
  if (!quoteUploadError) return;

  quoteUploadError.textContent = message;
  quoteUploadError.classList.add("active");
}

function clearQuoteUploadError() {
  if (!quoteUploadError) return;

  quoteUploadError.textContent = "";
  quoteUploadError.classList.remove("active");
}

function setQuoteContactButtonState(activeButton, isLoading) {
  [quoteWhatsappBtn, quoteEmailBtn].forEach((button) => {
    if (!button) return;

    const label = button.querySelector("span");

    if (isLoading) {
      if (!button.dataset.originalText && label) {
        button.dataset.originalText = label.textContent || "";
      }

      button.classList.toggle("is-loading", button === activeButton);
      button.classList.toggle("is-disabled", button !== activeButton);
      button.setAttribute("aria-disabled", "true");

      if (button === activeButton && label) {
        label.textContent = "Preparando Imagen...";
      }
    } else {
      button.classList.remove("is-loading");
      button.classList.remove("is-disabled");
      button.setAttribute("aria-disabled", "false");

      if (label && button.dataset.originalText) {
        label.textContent = button.dataset.originalText;
      }
    }
  });
}

async function createQuoteDesignImageBlob() {
  const viewer = window.starbadeViewer3D;

  if (!viewer?.captureDesignImage) {
    throw new Error("El visor 3D todavia no esta listo para exportar la imagen.");
  }

  setKitCameraView("full");

  return viewer.captureDesignImage({
    view: "full",
    teamName: getQuoteTeamName()
  });
}

async function uploadQuoteDesignImage(imageBlob) {
  const response = await fetch(designImageUploadEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "image/png"
    },
    body: imageBlob
  });
  let payload = null;

  try {
    payload = await response.json();
  } catch (error) {
    payload = null;
  }

  if (!response.ok || !payload?.url) {
    throw new Error(payload?.message || "No se pudo subir la imagen del diseño.");
  }

  return payload.url;
}

async function createAndUploadQuoteDesignLink() {
  viewer3dRoot?.classList.add("is-exporting-image");

  try {
    const imageBlob = await createQuoteDesignImageBlob();

    return await uploadQuoteDesignImage(imageBlob);
  } finally {
    viewer3dRoot?.classList.remove("is-exporting-image");
  }
}

function getWhatsappPendingLogoUrl() {
  try {
    return new URL("./textures/logos/starbade.png", window.location.href).href;
  } catch (error) {
    return "./textures/logos/starbade.png";
  }
}

function showWhatsappPendingPage(pendingWindow) {
  if (!pendingWindow) return;

  const isDarkMode = document.body.classList.contains("theme-dark");
  const theme = isDarkMode
    ? {
        background: "#111111",
        card: "#1c1c1c",
        border: "#282828",
        text: "#ffffff",
        muted: "#b8b8b8",
        logoFilter: "none"
      }
    : {
        background: "#f8f8f8",
        card: "#ffffff",
        border: "#d8d8d8",
        text: "#1c1c1c",
        muted: "#606060",
        logoFilter: "brightness(0) saturate(100%) invert(9%) sepia(0%) saturate(0%) hue-rotate(146deg) brightness(96%) contrast(85%)"
      };
  const logoUrl = getWhatsappPendingLogoUrl();

  try {
    pendingWindow.document.open();
    pendingWindow.document.write(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>Preparando tu dise\u00f1o - Starbade</title>
  <style>
    * {
      box-sizing: border-box;
    }

    html,
    body {
      width: 100%;
      min-height: 100%;
      margin: 0;
    }

    body {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      min-height: 100svh;
      padding: 24px;
      background: ${theme.background};
      color: ${theme.text};
      font-family: Arial, Helvetica, sans-serif;
      -webkit-text-size-adjust: 100%;
    }

    .pending-card {
      width: min(360px, calc(100vw - 32px));
      padding: 30px 24px;
      border: 1px solid ${theme.border};
      border-radius: 8px;
      background: ${theme.card};
      text-align: center;
    }

    .pending-logo {
      display: block;
      width: 150px;
      height: auto;
      margin: 0 auto 28px;
      filter: ${theme.logoFilter};
    }

    .pending-spinner {
      width: 34px;
      height: 34px;
      margin: 0 auto 22px;
      border: 3px solid ${theme.border};
      border-top-color: #e00012;
      border-radius: 999px;
      animation: spin 0.85s linear infinite;
    }

    .is-ready .pending-spinner {
      display: none;
    }

    .pending-title {
      margin: 0 0 10px;
      font-size: 20px;
      line-height: 1.25;
      font-weight: 800;
    }

    .pending-text {
      margin: 0;
      color: ${theme.muted};
      font-size: 15px;
      line-height: 1.45;
    }

    .pending-actions {
      display: none;
      margin-top: 22px;
    }

    .is-ready .pending-actions {
      display: block;
    }

    .pending-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      min-height: 44px;
      padding: 0 18px;
      border-radius: 8px;
      background: #e00012;
      color: #ffffff;
      font-size: 15px;
      font-weight: 800;
      text-decoration: none;
    }

    @media (max-width: 480px) {
      body {
        padding: 16px;
      }

      .pending-card {
        width: 100%;
        max-width: 360px;
        padding: 28px 22px;
      }

      .pending-logo {
        width: 136px;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>
</head>
<body>
  <main class="pending-card" aria-live="polite">
    <img class="pending-logo" src="${logoUrl}" alt="Starbade">
    <div class="pending-spinner" aria-hidden="true"></div>
    <h1 class="pending-title" id="pendingTitle">Estamos preparando tu dise\u00f1o</h1>
    <p class="pending-text" id="pendingText">En unos segundos te llevamos a WhatsApp con el mensaje listo.</p>
    <div class="pending-actions">
      <a class="pending-button" id="pendingWhatsappButton" href="#" rel="noopener">Abrir WhatsApp</a>
    </div>
  </main>
  <script>
    (function () {
      window.starbadeSendToWhatsapp = function (payload) {
        var webUrl = payload && payload.webUrl;
        var title = document.getElementById("pendingTitle");
        var text = document.getElementById("pendingText");
        var button = document.getElementById("pendingWhatsappButton");

        document.documentElement.classList.add("is-ready");

        if (title) {
          title.textContent = "Tu dise\u00f1o est\u00e1 listo";
        }

        if (text) {
          text.textContent = "Ya est\u00e1 listo. Te estamos llevando a WhatsApp.";
        }

        if (button && webUrl) {
          button.href = webUrl;
        }

        if (webUrl) {
          window.setTimeout(function () {
            window.location.href = webUrl;
          }, 180);
        }
      };
    }());
  <\/script>
</body>
</html>`);
    pendingWindow.document.close();
  } catch (error) {
    console.warn("No se pudo mostrar la pantalla de espera de WhatsApp.", error);
  }
}

function sendPendingWhatsappWindowToContact(pendingWindow, webUrl) {
  if (!pendingWindow) return false;

  try {
    if (pendingWindow.closed) return false;

    if (typeof pendingWindow.starbadeSendToWhatsapp === "function") {
      pendingWindow.starbadeSendToWhatsapp({ webUrl });
      return true;
    }

    pendingWindow.location.href = webUrl;
    return true;
  } catch (error) {
    try {
      pendingWindow.location.href = webUrl;
      return true;
    } catch (fallbackError) {
      return false;
    }
  }
}

async function handleQuoteContactClick(event, contactType) {
  event.preventDefault();

  if (quoteContactRequestInProgress) return;
  if (!validateQuoteForm()) return;

  const activeButton = event.currentTarget;

  quoteContactRequestInProgress = true;
  clearQuoteUploadError();
  setQuoteContactButtonState(activeButton, true);

  const pendingWhatsappWindow = contactType === "whatsapp"
    ? window.open("about:blank", "_blank")
    : null;
  showWhatsappPendingPage(pendingWhatsappWindow);

  try {
    const designImageUrl = await createAndUploadQuoteDesignLink();
    const contactUrl = contactType === "whatsapp"
      ? buildQuoteWhatsappUrl(designImageUrl)
      : buildQuoteEmailUrl(designImageUrl);

    updateQuoteContactLinks(designImageUrl);

    if (contactType === "whatsapp") {
      if (!sendPendingWhatsappWindowToContact(pendingWhatsappWindow, contactUrl)) {
        allowBeforeUnloadTemporarily();
        window.location.href = contactUrl;
      }
    } else {
      allowBeforeUnloadTemporarily();
      window.location.href = contactUrl;
    }
  } catch (error) {
    pendingWhatsappWindow?.close();
    console.warn("No se pudo generar el link del diseño para la cotización.", error);
    showQuoteUploadError("No pudimos generar el link del diseño. Probá de nuevo en unos segundos.");
  } finally {
    quoteContactRequestInProgress = false;
    setQuoteContactButtonState(activeButton, false);
  }
}

function openQuoteRequestPanel() {
  if (!validateQuoteForm()) {
    return;
  }

  clearQuoteUploadError();
  updateQuoteContactLinks();

  quoteRequestOverlay?.classList.add("active");
  quoteRequestPanel?.classList.add("active");

  document.body.style.overflow = "hidden";
}

function closeDesignPanelFn() {
  designPanel.classList.add("closing");

  designOverlay.classList.remove("active");

  setTimeout(() => {
    designPanel.classList.remove("active");
    designPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function closeMoldPanelFn() {
  moldPanel.classList.add("closing");

  moldOverlay.classList.remove("active");

  setTimeout(() => {
    moldPanel.classList.remove("active");
    moldPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function closeViewerWarningPanelFn() {
  if (!viewerWarningPanel?.classList.contains("active")) return;

  viewerWarningPanel.classList.add("closing");

  viewerWarningOverlay?.classList.remove("active");

  setTimeout(() => {
    viewerWarningPanel.classList.remove("active");
    viewerWarningPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function closePerformanceWarningPanelFn() {
  if (!performanceWarningPanel?.classList.contains("active")) return;

  if (performanceWarningDontShow?.checked) {
    saveDismissedPerformanceWarning();
  }

  performanceWarningPanel.classList.add("closing");

  performanceWarningOverlay?.classList.remove("active");

  setTimeout(() => {
    performanceWarningPanel.classList.remove("active");
    performanceWarningPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function closeSaveDesignPanelFn() {
  if (!saveDesignPanel?.classList.contains("active")) return;

  saveDesignPanel.classList.add("closing");

  saveDesignOverlay?.classList.remove("active");

  setTimeout(() => {
    saveDesignPanel.classList.remove("active");
    saveDesignPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function closeQuoteRequestPanelFn() {
  if (!quoteRequestPanel?.classList.contains("active")) return;

  clearQuoteUploadError();
  quoteRequestPanel.classList.add("closing");

  quoteRequestOverlay?.classList.remove("active");

  setTimeout(() => {
    quoteRequestPanel.classList.remove("active");
    quoteRequestPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function openSponsorPanel() {
  sponsorOverlay.classList.add("active");
  sponsorPanel.classList.add("active");

  document.body.style.overflow = "hidden";
}

function openBackSponsorPanel() {
  backSponsorOverlay.classList.add("active");
  backSponsorPanel.classList.add("active");

  document.body.style.overflow = "hidden";
}

function closeSponsorPanelFn() {
  sponsorPanel.classList.add("closing");

  sponsorOverlay.classList.remove("active");

  setTimeout(() => {
    sponsorPanel.classList.remove("active");
    sponsorPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function closeBackSponsorPanelFn() {
  backSponsorPanel.classList.add("closing");

  backSponsorOverlay.classList.remove("active");

  setTimeout(() => {
    backSponsorPanel.classList.remove("active");
    backSponsorPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function openDorsalTypePanel() {
  dorsalTypeOverlay.classList.add("active");
  dorsalTypePanel.classList.add("active");

  document.body.style.overflow = "hidden";
  updateDorsalPreview();
}

function closeDorsalTypePanelFn() {
  dorsalTypePanel.classList.add("closing");

  dorsalTypeOverlay.classList.remove("active");

  setTimeout(() => {
    dorsalTypePanel.classList.remove("active");
    dorsalTypePanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function openDesignsPanel() {
  designsOverlay.classList.add("active");
  designsPanel.classList.add("active");

  document.body.style.overflow = "hidden";
}

function closeDesignsPanelFn() {
  designsPanel.classList.add("closing");

  designsOverlay.classList.remove("active");

  setTimeout(() => {
    designsPanel.classList.remove("active");
    designsPanel.classList.remove("closing");

    document.body.style.overflow = "";
  }, 180);
}

function syncDesignSelectionItems() {
  traditionalDesignItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.design === selectedDesign);
  });
}

function openDesignCategoryPanel(panel) {
  designsPanel.classList.remove("active");
  panel.classList.add("active");
  syncDesignSelectionItems();
}

function openCatalogDesignsPanel() {
  openDesignCategoryPanel(catalogDesignsPanel);
}

function openTraditionalDesignsPanel() {
  openDesignCategoryPanel(traditionalDesignsPanel);
}

function closeDesignCategoryPanel(panel) {
  panel.classList.add("closing");

  setTimeout(() => {
    panel.classList.remove("active");
    panel.classList.remove("closing");
    designsOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }, 180);
}

function closeCatalogDesignsPanelFn() {
  closeDesignCategoryPanel(catalogDesignsPanel);
}

function closeTraditionalDesignsPanelFn() {
  closeDesignCategoryPanel(traditionalDesignsPanel);
}

function backToDesignsPanel(panel) {
  panel.classList.remove("active");
  designsPanel.classList.add("active");
}

addShieldBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openDesignPanel();
});

mobileAddShieldBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openDesignPanel();
});

addSponsorBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openSponsorPanel();
});

changeMoldBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openMoldPanel();
});

mobileAddSponsorBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openSponsorPanel();
});

backSponsorBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openBackSponsorPanel();
});

mobileBackSponsorBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openBackSponsorPanel();
});

dorsalTypeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openDorsalTypePanel();
});

mobileDorsalTypeBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openDorsalTypePanel();
});

closeDorsalTypePanel?.addEventListener("click", closeDorsalTypePanelFn);
dorsalTypeOverlay?.addEventListener("click", closeDorsalTypePanelFn);

addDesignBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  openDesignsPanel();
});

mobileAddDesignBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  openDesignsPanel();
});

viewerWarningBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  openViewerWarningPanel();
});

viewerWarningActivateSidePanels?.addEventListener("click", (e) => {
  e.stopPropagation();

  if (!panelLateralesEnabled) {
    panelLateralesEnabled = true;
    syncPanelLateralesToggle();
    applyKitSidePanelState();
    applyKitSidePanelBorderState();
  }

  closeViewerWarningPanelFn();
});

catalogDesignsBtn.addEventListener("click", openCatalogDesignsPanel);
traditionalDesignsBtn.addEventListener("click", openTraditionalDesignsPanel);

closeDesignPanel?.addEventListener("click", closeDesignPanelFn);
designOverlay?.addEventListener("click", closeDesignPanelFn);
closeMoldPanel?.addEventListener("click", closeMoldPanelFn);
moldOverlay?.addEventListener("click", closeMoldPanelFn);
closeViewerWarningPanel?.addEventListener("click", closeViewerWarningPanelFn);
viewerWarningOverlay?.addEventListener("click", closeViewerWarningPanelFn);
closePerformanceWarningPanel?.addEventListener("click", closePerformanceWarningPanelFn);
performanceWarningOverlay?.addEventListener("click", closePerformanceWarningPanelFn);
performanceWarningAcceptBtn?.addEventListener("click", closePerformanceWarningPanelFn);
closeAutosaveRecoveryPanel?.addEventListener("click", closeAutosaveRecoveryPanelFn);
autosaveRecoveryOverlay?.addEventListener("click", closeAutosaveRecoveryPanelFn);
recoverAutosaveDesignBtn?.addEventListener("click", () => {
  restoreConfiguratorAutosaveSnapshot(readConfiguratorAutosaveSnapshot());
});
discardAutosaveDesignBtn?.addEventListener("click", discardConfiguratorAutosaveSnapshot);
closeSaveDesignPanel?.addEventListener("click", closeSaveDesignPanelFn);
saveDesignOverlay?.addEventListener("click", closeSaveDesignPanelFn);
closeQuoteRequestPanel?.addEventListener("click", closeQuoteRequestPanelFn);
quoteRequestOverlay?.addEventListener("click", closeQuoteRequestPanelFn);
closeSponsorPanel?.addEventListener("click", closeSponsorPanelFn);
sponsorOverlay?.addEventListener("click", closeSponsorPanelFn);
closeBackSponsorPanel?.addEventListener("click", closeBackSponsorPanelFn);
backSponsorOverlay?.addEventListener("click", closeBackSponsorPanelFn);
closeDesignsPanel.addEventListener("click", closeDesignsPanelFn);

closeCatalogDesignsPanel.addEventListener(
  "click",
  closeCatalogDesignsPanelFn
);

closeTraditionalDesignsPanel.addEventListener(
  "click",
  closeTraditionalDesignsPanelFn
);

moldOptionItems.forEach((item) => {
  item.addEventListener("click", () => {
    const moldKey = item.dataset.mold;

    if (kitMoldPaths[moldKey]) {
      window.starbadeViewer3D?.setMold?.(moldKey);
    }

    closeMoldPanelFn();
  });
});

traditionalDesignsBack.addEventListener(
  "click",
  () => backToDesignsPanel(traditionalDesignsPanel)
);

catalogDesignsBack.addEventListener(
  "click",
  () => backToDesignsPanel(catalogDesignsPanel)
);

function syncDesignColorControls() {
  const isTwoColor = twoColorDesigns.has(kitDesignState.selectedDesign);

  [designColorControls, mobileDesignColorControls].forEach((controls) => {
    controls?.classList.toggle("is-two-color", isTwoColor);
  });

  colorTargets.design.buttons.forEach((button) => {
    const label = button?.querySelector("span");

    if (label) {
      label.textContent = isTwoColor ? "Color Diseño 1" : "Color Diseño";
    }
  });
}

function syncViewerWarningIcon({ openPanel = false } = {}) {
  if (!viewerWarningBtn) return;

  const shouldShowWarning = (
    !panelLateralesEnabled &&
    sideContinuityWarningDesigns.has(kitDesignState.selectedDesign)
  );

  viewerWarningBtn.hidden = !shouldShowWarning;

  if (openPanel && shouldShowWarning) {
    openViewerWarningPanel();
  }
}

function setSelectedDesign(designId, { openWarning = true } = {}) {
  selectedDesign = designId;
  kitDesignState.selectedDesign = designId;

  const iconMap = {
    "sin-diseno": "./textures/icons/icon_sin_diseno.png",
    "2-bastones": "./textures/icons/icon_2_bastones.png",
    "3-bastones": "./textures/icons/icon_3_bastones.png",
    "4-bastones": "./textures/icons/icon_4_bastones.png",
    "banda-diagonal": "./textures/icons/icon_banda_diagonal.png",
    "banda-diagonal-2": "./textures/icons/icon_banda_diagonal2.png",
    "franja-horizontal": "./textures/icons/icon_franja_hzt.png",
    "chevron": "./textures/icons/icon_chevron.png",
    "mitad": "./textures/icons/icon_mitad.png",
    "hoops": "./textures/icons/icon_hoops.png",
    hoops2: "./textures/icons/icon_hoops2.png",
    "franja-vertical": "./textures/icons/icon_franja_vtc.png",
    "cuadros-4": "./textures/icons/icon_4_cuadros.png",
    "mitad-diagonal": "./textures/icons/icon_mitad_diagonal.png",
    "mitad-diagonal-2": "./textures/icons/icon_mitad_diagonal2.png",
    "pinstripes": "./textures/icons/icon_pinstripes.png",
    cuadros: "./textures/icons/icon_cuadros.png",
    "bloque-superior": "./textures/icons/icon_bloque_superior.png",
    "franja-escudo": "./textures/icons/icon2_franja_escudo.png",
    "franja-escudo-2": "./textures/icons/icon2_franja_escudo2.png",
    "franja-central": "./textures/icons/icon2_franja_central.png",
    "chevron-dos-colores": "./textures/icons/icon2_chevron.png",
    "banda-diagonal-dos-colores": "./textures/icons/icon2_banda_diagonal.png",
    "banda-diagonal-2-dos-colores": "./textures/icons/icon2_banda_diagonal2.png",
    "franja-horizontal-dos-colores": "./textures/icons/icon2_franja_hzt.png",
    bandera: "./textures/icons/icon2_bandera.png",
    "franja-vertical-dos-colores": "./textures/icons/icon2_franja_vtc.png",
    "degrade-linea": "./textures/icons/iconsb_degrade.png",
    ondas: "./textures/icons/iconsb_ondas.png",
    zigzag: "./textures/icons/iconsb_zigzag.png",
    "zigzag-2": "./textures/icons/iconsb_zigzag2.png",
    "rayas-diagonales": "./textures/icons/iconsb_rayas_diagonales.png",
    "lineas-finas": "./textures/icons/iconsb_lineas_finas.png",
    tribal: "./textures/icons/iconsb_tribal.png",
    rocoso: "./textures/icons/iconsb_rocoso.png",
    marmol: "./textures/icons/iconsb_marmol.png",
    halftone: "./textures/icons/iconsb_halftone.png",
    flechas: "./textures/icons/iconsb_flechas.png",
    estrellado: "./textures/icons/iconsb_estrellado.png",
    lineas: "./textures/icons/iconsb_lineas.png",
    "lineas-circulares": "./textures/icons/iconsb_lineas_circulares.png",
    "2-bastones-catalogo": "./textures/icons/iconsb_2bastones.png",
    rombos: "./textures/icons/iconsb_rombos.png",
    grietas: "./textures/icons/iconsb_grietas.png",
    grunge: "./textures/icons/iconsb_grunge.png",
    garra: "./textures/icons/iconsb_garra.png",
    "franja-halftone": "./textures/icons/iconsb_franja_halftone.png",
    olas: "./textures/icons/iconsb_olas.png",
    geometrico: "./textures/icons/iconsb_geometrico.png",
    rafaga: "./textures/icons/iconsb_rafaga.png",
    "mangas-triangulos": "./textures/icons/iconsbmangas_triangulos.png",
    "mangas-ondas": "./textures/icons/iconsbmangas_ondas.png",
    "mangas-fuego": "./textures/icons/iconsbmangas_fuego.png",
    "mangas-hexagonos": "./textures/icons/iconsbmangas_hexagonos.png",
    "mangas-animal-print": "./textures/icons/iconsbmangas_animalprint.png",
    "mangas-circulos": "./textures/icons/iconsbmangas_circulos.png",
    "mangas-cuadros": "./textures/icons/iconsbmangas_cuadros.png",
    "mangas-curvas": "./textures/icons/iconsbmangas_curvas.png",
    "mangas-floral": "./textures/icons/iconsbmangas_floral.png",
    "mangas-picos": "./textures/icons/iconsbmangas_picos.png",
    "mangas-abstracto": "./textures/icons/iconsbmangas_abstracto.png",
    "mangas-art-deco": "./textures/icons/iconsbmangas_artdeco.png",
    "rayas-con-puntos": "./textures/icons/iconsb2_rayas_con_puntos.png",
    "rayas-con-grunge": "./textures/icons/iconsb2_rayas_con_grunge.png",
    "rayas-diagonales-dos-colores": "./textures/icons/iconsb2_rayas_diagonales.png",
    mosaico: "./textures/icons/iconsb2_mosaico.png",
    "halftone-diagonal": "./textures/icons/iconsb2_halftone_diagonal.png",
    "2-bastones-con-lineas": "./textures/icons/icon2_2bastones_con_lineas.png",
    "3-bastones-con-lineas": "./textures/icons/icon2_3bastones_con_lineas.png",
    "4-bastones-con-lineas": "./textures/icons/icon2_4bastones_con_lineas.png",
    "marmol-dos-colores": "./textures/icons/iconsb2_marmol.png",
    formas: "./textures/icons/iconsb2_formas.png",
    camuflaje: "./textures/icons/iconsb2_camuflaje.png",
    abstracto: "./textures/icons/iconsb2_abstracto.png",
    puas: "./textures/icons/iconsb2_puas.png",
    glitch: "./textures/icons/iconsb2_glitch.png",
    espinas: "./textures/icons/iconsb2_espinas.png"
  };

  const iconSrc = iconMap[designId] || "./textures/icons/icon_sin_diseno.png";

  const desktopIcon = addDesignBtn.querySelector("img");
  const mobileIcon = mobileAddDesignBtn.querySelector("img");

  setThemeableIconSrc(desktopIcon, iconSrc);
  setThemeableIconSrc(mobileIcon, iconSrc);

  const desktopText = addDesignBtn.querySelector("span");
  const mobileText = mobileAddDesignBtn.querySelector("span");

  const label = designId === "sin-diseno"
    ? "Agregar Diseño"
    : "Cambiar Diseño";

  if (desktopText) desktopText.textContent = label;
  if (mobileText) mobileText.textContent = label;

  syncDesignSelectionItems();
  syncViewerWarningIcon({ openPanel: openWarning });

  syncDesignColorControls();
  disableStarbadeStrokesForCurrentDesign();
  disableDorsalStrokesForCurrentDesign();
  reconcileCurrentDesignColors();
  disableRanglanSleevePanelsForCurrentDesign();
  closeStarbadeStrokeRulePopup();
  applyKitDesignState();
}

function setSelectedDorsalVariant(variant) {

  selectedDorsalVariant = variant;

  dorsalVariant10Btn.classList.toggle(
    "active",
    variant === "10"
  );

  dorsalVariant1Btn.classList.toggle(
    "active",
    variant === "1"
  );

  updateDorsalPreview();
  applyBackDorsalNumberState();
  applyBackDorsalNumberStrokeState();
  applyShortDorsalNumberState();
}

function getDorsalPreviewPaths() {
  const name = `./textures/numbers/name_${selectedDorsalFont}.png`;
  const number = `./textures/numbers/number${selectedDorsalVariant}_${selectedDorsalFont}.png`;

  return {
    name,
    nameStroke: name.replace(".png", "_stroke.png"),
    number,
    numberStroke: number.replace(".png", "_stroke.png")
  };
}

function updateDorsalButtonIcon() {
  const iconSrc = `./textures/numbers/number${selectedDorsalVariant}_${selectedDorsalFont}.png`;

  dorsalTypeButtonIcon.src = iconSrc;
  mobileDorsalTypeButtonIcon.src = iconSrc;
}

function updateDorsalPreview() {
  const paths = getDorsalPreviewPaths();

  dorsalNamePreviewImage.src = paths.name;
  dorsalNumberPreviewImage.src = paths.number;
  updateDorsalButtonIcon();

  const fontLabels = {
    "2017": "Simple",
    ariq: "Moderna",
    broncos: "Inglesa",
    feyenoord: "Retro",
    jersey: "Clásica",
    jl: "Alta",
    lemands: "Elegante"
  };

  dorsalFontDropdownLabel.textContent = `(${fontLabels[selectedDorsalFont] || "Elegante"})`;

  dorsalFontOptions.forEach((option) => {
    option.classList.toggle("active", option.dataset.font === selectedDorsalFont);
  });
}

function setSelectedDorsalFont(fontKey) {
  selectedDorsalFont = fontKey;
  updateDorsalPreview();
  applyBackDorsalNumberState();
  applyBackDorsalNumberStrokeState();
  applyShortDorsalNumberState();
  applyBackDorsalNameState();
  applyBackDorsalNameStrokeState();
  dorsalFontPicker.classList.remove("is-open");
}

dorsalFontDropdownBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dorsalFontPicker.classList.toggle("is-open");
});

dorsalFontOptions.forEach((option) => {
  option.addEventListener("click", (e) => {
    e.stopPropagation();
    setSelectedDorsalFont(option.dataset.font);
  });
});

dorsalFontPicker.addEventListener("click", (e) => {
  e.stopPropagation();
});

document.addEventListener("click", () => {
  dorsalFontPicker.classList.remove("is-open");
});

traditionalDesignItems.forEach((item) => {
  item.addEventListener("click", () => {
    const designId = item.dataset.design;
    const categoryPanel = item.closest(".traditional-designs-panel");

    setSelectedDesign(designId);

    if (categoryPanel === catalogDesignsPanel) {
      closeCatalogDesignsPanelFn();
      return;
    }

    closeTraditionalDesignsPanelFn();
  });
});

dorsalVariant10Btn?.addEventListener("click", () => {
  setSelectedDorsalVariant("10");
});

dorsalVariant1Btn?.addEventListener("click", () => {
  setSelectedDorsalVariant("1");
});

designsOverlay.addEventListener("click", () => {
  if (catalogDesignsPanel.classList.contains("active")) {
    closeCatalogDesignsPanelFn();
    return;
  }

  if (traditionalDesignsPanel.classList.contains("active")) {
    closeTraditionalDesignsPanelFn();
    return;
  }

  closeDesignsPanelFn();
});

function setAssetButtonIcons(icons, src, options = {}) {
  const isUserUploadPreview = Boolean(options.isUserUploadPreview);

  icons.forEach((icon) => {
    if (!icon) return;

    icon.src = src;
    icon.classList.toggle("is-user-upload-preview", isUserUploadPreview);
  });
}

function setAssetButtonLabels(labels, text) {
  labels.forEach((label) => {
    if (!label) return;

    label.textContent = text;
  });
}

const desktopUploadMediaQuery = window.matchMedia?.("(hover: hover) and (pointer: fine)");

function canUseDesktopDragUpload() {
  return desktopUploadMediaQuery?.matches ?? window.innerWidth > 768;
}

function getVisualAssetUploadText(config) {
  const hasImage = config.uploadBox?.classList.contains("has-image");

  if (hasImage) {
    return canUseDesktopDragUpload()
      ? (config.desktopChangeUploadText || config.changeUploadText)
      : config.changeUploadText;
  }

  return canUseDesktopDragUpload()
    ? (config.desktopAddUploadText || config.addUploadText)
    : config.addUploadText;
}

function syncVisualAssetUploadText(config) {
  if (!config.uploadText) return;

  config.uploadText.textContent = getVisualAssetUploadText(config);
}

function isValidVisualAssetFile(file) {
  if (!file) return false;
  if (file.type?.startsWith("image/")) return true;

  return /\.(png|jpe?g|webp)$/i.test(file.name || "");
}

function assignDroppedFileToInput(input, file) {
  if (!input || typeof DataTransfer === "undefined") return;

  try {
    const transfer = new DataTransfer();

    transfer.items.add(file);
    input.files = transfer.files;
  } catch (error) {
    // Some browsers do not allow assigning dropped files to file inputs.
  }
}

function setupVisualAssetDropZone(config) {
  if (!config.uploadBox || !config.onFileSelected) return;

  const hideDragState = () => {
    config.uploadBox.classList.remove("is-drag-over");
  };

  desktopUploadMediaQuery?.addEventListener?.("change", () => {
    syncVisualAssetUploadText(config);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    config.uploadBox.addEventListener(eventName, (event) => {
      if (!canUseDesktopDragUpload()) return;

      event.preventDefault();
      event.stopPropagation();
      config.uploadBox.classList.add("is-drag-over");
    });
  });

  config.uploadBox.addEventListener("dragleave", (event) => {
    if (!canUseDesktopDragUpload()) return;

    event.preventDefault();
    event.stopPropagation();

    if (!config.uploadBox.contains(event.relatedTarget)) {
      hideDragState();
    }
  });

  config.uploadBox.addEventListener("drop", (event) => {
    if (!canUseDesktopDragUpload()) return;

    event.preventDefault();
    event.stopPropagation();
    hideDragState();

    const file = event.dataTransfer?.files?.[0];

    if (!file) return;

    if (!isValidVisualAssetFile(file)) {
      if (config.warningPopup) {
        config.warningPopup.textContent = config.invalidWarningText || "El archivo debe ser una imagen.";
        config.warningPopup.classList.add("active");
      }

      return;
    }

    if (config.warningPopup) {
      config.warningPopup.textContent = config.warningText;
      config.warningPopup.classList.remove("active");
    }

    assignDroppedFileToInput(config.input, file);
    config.onFileSelected(file);
  });
}

function updateVisualAsset(config, file) {
  const state = visualAssetState[config.stateKey];

  if (state.previewUrl) {
    URL.revokeObjectURL(state.previewUrl);
  }

  const imageUrl = URL.createObjectURL(file);

  state.file = file;
  state.previewUrl = imageUrl;

  config.preview.src = imageUrl;
  setAssetButtonIcons(config.triggerIcons, imageUrl, { isUserUploadPreview: true });
  setAssetButtonLabels(config.triggerLabels, config.changeButtonText);

  config.uploadBox.classList.add("has-image");
  syncVisualAssetUploadText(config);
  config.onUpdate?.(state);
}

function clearVisualAsset(config) {
  const state = visualAssetState[config.stateKey];

  if (state.previewUrl) {
    URL.revokeObjectURL(state.previewUrl);
  }

  state.file = null;
  state.previewUrl = "";

  config.input.value = "";
  config.preview.src = "";
  setAssetButtonIcons(config.triggerIcons, config.defaultIcon || defaultLogoIcon);
  setAssetButtonLabels(config.triggerLabels, config.addButtonText);

  config.uploadBox.classList.remove("has-image");
  syncVisualAssetUploadText(config);
  config.warningPopup.classList.remove("active");
  config.onClear?.(state);
}

function setupVisualAssetUploader(config) {
  syncVisualAssetUploadText(config);
  config.warningPopup.textContent = config.warningText;
  config.onFileSelected = (file) => updateVisualAsset(config, file);
  setupVisualAssetDropZone(config);

  config.applyButton?.addEventListener("click", (event) => {
    event.stopPropagation();

    config.warningPopup.textContent = config.warningText;

    if (!config.input.files?.length && !visualAssetState[config.stateKey]?.file) {
      config.warningPopup.classList.add("active");
      return;
    }

    config.closePanel();
  });

  config.input?.addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    config.onFileSelected(file);
  });

  config.deleteButton?.addEventListener("click", () => {
    const state = visualAssetState[config.stateKey];

    if (!config.input.files?.length && !state.file) return;

    clearVisualAsset(config);
  });

  document.addEventListener("click", (event) => {
    if (!config.warningPopup.classList.contains("active")) return;

    const clickedPopup = config.warningPopup.contains(event.target);

    if (clickedPopup) {
      config.warningPopup.classList.remove("active");
      return;
    }

    const clickedApplyButton = config.applyButton.contains(event.target);

    if (!clickedApplyButton) {
      config.warningPopup.classList.remove("active");
    }
  });
}

function applyColorToTarget(color, previewColor) {
  color = normalizeConfigurableModelColor(color) || color;
  previewColor = previewColor || getPreviewColorForModelColor(color);

  const target = colorTargets[activeColorTarget];

  if (!target) return false;

  const validationMessage = target.validateColor?.(color);

  if (validationMessage) {
    showColorConflictRulePopup(validationMessage);
    return false;
  }

  if (target.getConflictColor && isSameColor(color, target.getConflictColor())) {
    const conflictResolved = target.resolveColorConflict?.(color) || false;

    if (!conflictResolved) {
      if (target.conflictMessage) {
        showColorConflictRulePopup(target.conflictMessage);
      }

      return false;
    }
  }

  if (target.groupKey) {
    const group = splitGroups[target.groupKey];

    if (!group) return false;

    if (target.mode === "combined") {
      group.combinedColor = color;
      group.hasModelColor = true;
      setPreviewBackgrounds(target.previews, previewColor);
      applySplitGroupMaterialState(target.groupKey);
      if (target.groupKey === "sleeves") reconcileCurrentDesignColors();
      return true;
    }

    if (target.mode === "left") {
      group.leftColor = color;
      group.hasModelColor = true;
      setPreviewBackgrounds(target.previews, previewColor);
      applySplitGroupMaterialState(target.groupKey);
      if (target.groupKey === "sleeves") reconcileCurrentDesignColors();
      return true;
    }

    if (target.mode === "right") {
      group.rightColor = color;
      group.hasModelColor = true;
      setPreviewBackgrounds(target.previews, previewColor);
      applySplitGroupMaterialState(target.groupKey);
      if (target.groupKey === "sleeves") reconcileCurrentDesignColors();
      return true;
    }
  }

  if (target.previewMode === "border") {
    syncStrokePreview(activeColorTarget, color, previewColor);
    target.onApply?.(color);
    return true;
  }

  setPreviewBackgrounds(target.previews, previewColor);
  target.onApply?.(color);
  return true;
}

closeColorPopupBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closePopup();
});

colorInfoBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (colorPopupInfo.classList.contains("active")) {
    closeInfoPopup();
  } else {
    openInfoPopup();
  }
});

function setupCharacterLimitHint(input, hint) {
  if (!input || !hint) return;

  let hideTimer = null;
  const maxLength = Number(input.maxLength);

  if (!Number.isFinite(maxLength) || maxLength <= 0) return;

  const showHint = () => {
    hint.classList.add("active");

    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      hint.classList.remove("active");
    }, 5000);
  };

  input.addEventListener("beforeinput", (event) => {
    if (event.inputType?.startsWith("delete")) return;

    const selectedLength = input.selectionEnd - input.selectionStart;
    const nextTextLength = event.data?.length || 0;
    const nextLength = input.value.length - selectedLength + nextTextLength;

    if (input.value.length >= maxLength || nextLength > maxLength) {
      showHint();
    }
  });
}

setupCharacterLimitHint(quoteNameInput, quoteNameLimitHint);
setupCharacterLimitHint(mobileQuoteNameInput, mobileQuoteNameLimitHint);
setupCharacterLimitHint(quoteTeamInput, quoteTeamLimitHint);
setupCharacterLimitHint(mobileQuoteTeamInput, mobileQuoteTeamLimitHint);

[quoteNameInput, mobileQuoteNameInput, quoteTeamInput, mobileQuoteTeamInput].forEach((input) => {
  input?.addEventListener("input", () => {
    if (input.value.trim()) {
      setQuoteInputError(input, false);
    }
  });
});

function syncQuoteSizeButtons() {
  quoteSizeButtons.forEach((button) => {
    const isActive = quoteSizeState.has(button.dataset.quoteSize);

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

quoteSizeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const sizeKey = button.dataset.quoteSize;

    if (quoteSizeState.has(sizeKey)) {
      quoteSizeState.delete(sizeKey);
    } else {
      quoteSizeState.add(sizeKey);
    }

    syncQuoteSizeButtons();
    if (quoteSizeState.size > 0) {
      setQuoteSizeError(false);
    }
  });
});

colorPopupInfo.addEventListener("click", (e) => {
  e.stopPropagation();
  closeInfoPopup();
});

[lapelInfoBtn, mobileLapelInfoBtn].forEach((button) => {
  button?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    showLapelRulePopup(button);
  });

  button?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;

    event.preventDefault();
    event.stopPropagation();
    showLapelRulePopup(button);
  });
});

Object.entries(colorTargets).forEach(([targetKey, target]) => {
  target.buttons.forEach((button) => {
    button.addEventListener("click", (e) => {

      if (button.disabled || button.classList.contains("is-disabled")) return;

      e.stopPropagation();
      openColorPopup(targetKey);

    });
  });
});

[panelHombrosToggle, mobilePanelHombrosToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (isRanglanSleevePanelBlockedForCurrentDesign()) {
      showStarbadeStrokeRulePopup(toggle);
      return;
    }

    panelHombrosEnabled = !panelHombrosEnabled;
    syncPanelHombrosToggle();
    applyKitShoulderPanelState();
    applyKitShoulderPanelBorderState();
  });
});

[borderPanelHombrosToggle, mobileBorderPanelHombrosToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!panelHombrosEnabled) return;

    if (isRanglanSleevePanelBlockedForCurrentDesign()) {
      showStarbadeStrokeRulePopup(toggle);
      return;
    }

    borderPanelHombrosEnabled = !borderPanelHombrosEnabled;
    syncBorderPanelHombrosToggle();
    applyKitShoulderPanelBorderState();
  });
});

[panelLateralesToggle, mobilePanelLateralesToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    panelLateralesEnabled = !panelLateralesEnabled;
    syncPanelLateralesToggle();
    applyKitSidePanelState();
    applyKitSidePanelBorderState();
  });
});

[borderPanelLateralesToggle, mobileBorderPanelLateralesToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!panelLateralesEnabled) return;

    borderPanelLateralesEnabled = !borderPanelLateralesEnabled;
    syncBorderPanelLateralesToggle();
    applyKitSidePanelBorderState();
  });
});

[lineCuelloToggle, mobileLineCuelloToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    lineCuelloEnabled = !lineCuelloEnabled;
    syncLineCuelloToggle();
    applyKitNeckLineState();
  });
});

[linePunosToggle, mobileLinePunosToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    linePunosEnabled = !linePunosEnabled;
    syncLinePunosToggle();
    applyKitCuffLineState();
  });
});

[lineFinaToggle, mobileLineFinaToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    const nextState = !lineFinaEnabled;
    lineFinaEnabled = nextState;

    if (nextState) {
      lineGruesaEnabled = false;
    }

    syncShortLinesToggle();
    applyKitShortFineLineState();
    applyKitShortThickLineState();
  });
});

[lineGruesaToggle, mobileLineGruesaToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    const nextState = !lineGruesaEnabled;
    lineGruesaEnabled = nextState;

    if (nextState) {
      lineFinaEnabled = false;
    }

    syncShortLinesToggle();
    applyKitShortFineLineState();
    applyKitShortThickLineState();
  });
});

[lineInferiorToggle, mobileLineInferiorToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    lineInferiorEnabled = !lineInferiorEnabled;
    syncShortLinesToggle();
    applyKitShortBottomLineState();
  });
});

[starbadeStrokeToggle, mobileStarbadeStrokeToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!isFrontStarbadeStrokeAllowedForCurrentDesign()) {
      starbadeLogoState.strokeEnabled = false;
      syncStarbadeStrokeToggle();
      applyKitStarbadeStrokeState();
      reconcileStarbadeLogoColorsForCurrentRules();
      showStarbadeStrokeRulePopup(toggle);
      return;
    }

    closeStarbadeStrokeRulePopup();
    starbadeLogoState.strokeEnabled = !starbadeLogoState.strokeEnabled;
    syncStarbadeStrokeToggle();
    applyKitStarbadeStrokeState();
    reconcileStarbadeLogoColorsForCurrentRules();
  });
});

[backStarbadeStrokeToggle, mobileBackStarbadeStrokeToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!isBackStarbadeStrokeAllowedForCurrentDesign()) {
      starbadeLogoState.backStrokeEnabled = false;
      syncBackStarbadeStrokeToggle();
      applyKitBackStarbadeStrokeState();
      reconcileStarbadeLogoColorsForCurrentRules();
      showStarbadeStrokeRulePopup(toggle);
      return;
    }

    closeStarbadeStrokeRulePopup();
    starbadeLogoState.backStrokeEnabled = !starbadeLogoState.backStrokeEnabled;
    syncBackStarbadeStrokeToggle();
    applyKitBackStarbadeStrokeState();
    reconcileStarbadeLogoColorsForCurrentRules();
  });
});

[dorsalNumberToggle, mobileDorsalNumberToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    dorsalNumberState.numberEnabled = !dorsalNumberState.numberEnabled;
    syncDorsalNumberToggles();
    applyBackDorsalNumberState();
    applyBackDorsalNumberStrokeState();
  });
});

[dorsalNumberStrokeToggle, mobileDorsalNumberStrokeToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!dorsalNumberState.numberEnabled) {
      showStarbadeStrokeRulePopup(toggle, dorsalNumberStrokeRequiresNumberMessage);
      return;
    }

    if (!isDorsalStrokeAllowedForCurrentDesign()) {
      dorsalNumberState.strokeEnabled = false;
      syncDorsalNumberToggles();
      applyBackDorsalNumberStrokeState();
      showStarbadeStrokeRulePopup(toggle);
      return;
    }

    closeStarbadeStrokeRulePopup();
    dorsalNumberState.strokeEnabled = !dorsalNumberState.strokeEnabled;
    syncDorsalNumberToggles();
    applyBackDorsalNumberStrokeState();
  });
});

[dorsalNameToggle, mobileDorsalNameToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    dorsalNumberState.nameEnabled = !dorsalNumberState.nameEnabled;
    syncDorsalNumberToggles();
    applyBackDorsalNameState();
    applyBackDorsalNameStrokeState();
  });
});

[dorsalNameStrokeToggle, mobileDorsalNameStrokeToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!dorsalNumberState.nameEnabled) {
      showStarbadeStrokeRulePopup(toggle, dorsalNameStrokeRequiresNameMessage);
      return;
    }

    if (!isDorsalNameStrokeAllowedForCurrentDesign()) {
      dorsalNumberState.nameStrokeEnabled = false;
      syncDorsalNumberToggles();
      applyBackDorsalNameStrokeState();
      showStarbadeStrokeRulePopup(toggle);
      return;
    }

    closeStarbadeStrokeRulePopup();
    dorsalNumberState.nameStrokeEnabled = !dorsalNumberState.nameStrokeEnabled;
    syncDorsalNumberToggles();
    applyBackDorsalNameStrokeState();
  });
});

[shortShieldToggle, mobileShortShieldToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();

    if (!visualAssetState.shield.file) {
      showStarbadeStrokeRulePopup(toggle, "No se ha cargado un escudo.");
      return;
    }

    shortLogoState.shieldEnabled = !shortLogoState.shieldEnabled;
    syncShortLogoToggles();
    applyFrontShieldState();
  });
});

setupDisabledInfoPopup(
  [dorsalNumberStrokeColorBtn, dorsalNumberStrokeToggle],
  () => !dorsalNumberState.numberEnabled,
  (anchor) => showStarbadeStrokeRulePopup(anchor, dorsalNumberStrokeRequiresNumberMessage)
);

setupDisabledInfoPopup(
  [mobileDorsalNumberStrokeColorBtn, mobileDorsalNumberStrokeToggle],
  () => !dorsalNumberState.numberEnabled,
  (anchor) => showStarbadeStrokeRulePopup(anchor, dorsalNumberStrokeRequiresNumberMessage)
);

setupDisabledInfoPopup(
  [dorsalNameStrokeColorBtn, dorsalNameStrokeToggle],
  () => !dorsalNumberState.nameEnabled,
  (anchor) => showStarbadeStrokeRulePopup(anchor, dorsalNameStrokeRequiresNameMessage)
);

setupDisabledInfoPopup(
  [mobileDorsalNameStrokeColorBtn, mobileDorsalNameStrokeToggle],
  () => !dorsalNumberState.nameEnabled,
  (anchor) => showStarbadeStrokeRulePopup(anchor, dorsalNameStrokeRequiresNameMessage)
);

setupDisabledInfoPopup(
  [shortShieldBtn, shortShieldToggle],
  () => !visualAssetState.shield.file,
  (anchor) => showStarbadeStrokeRulePopup(anchor, "No se ha cargado un escudo.")
);

setupDisabledInfoPopup(
  [mobileShortShieldBtn, mobileShortShieldToggle],
  () => !visualAssetState.shield.file,
  (anchor) => showStarbadeStrokeRulePopup(anchor, "No se ha cargado un escudo.")
);

[shortNumberToggle, mobileShortNumberToggle].forEach((toggle) => {
  toggle?.addEventListener("click", (e) => {
    e.stopPropagation();
    shortLogoState.numberEnabled = !shortLogoState.numberEnabled;
    syncShortLogoToggles();
    applyShortDorsalNumberState();
  });
});

syncPanelHombrosToggle();
syncPanelLateralesToggle();
syncLineCuelloToggle();
syncLinePunosToggle();
syncShortLinesToggle();
syncStarbadeStrokeToggle();
syncDorsalNumberToggles();
syncBackStarbadeStrokeToggle();
syncShortLogoToggles();
syncMoldOptionItems();
syncMoldDependentLabels();
syncLapelAvailability();

Object.entries(splitGroups).forEach(([groupKey, group]) => {
  group.toggleButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleSplitGroup(groupKey);
    });
  });
});

function closeColorPopup(event) {

  const clickedInsidePopup = colorPopup.contains(event.target);

  if (!clickedInsidePopup) {
    closeInfoPopup();
    closePopup();
    return;
  }

  const clickedInfoButton = colorInfoBtn.contains(event.target);
  const clickedInfoPopup = colorPopupInfo.contains(event.target);

  if (
    colorPopupInfo.classList.contains("active") &&
    !clickedInfoButton &&
    !clickedInfoPopup
  ) {
    closeInfoPopup();
  }

}

document.addEventListener("click", closeColorPopup);

syncPopupTheme();

normalizeSponsorPanelText();

const shieldUploaderConfig = {
  stateKey: "shield",
  input: shieldUploadInput,
  uploadBox: shieldUploadBox,
  uploadText: shieldUploadText,
  warningPopup: shieldWarningPopup,
  warningText: "No se ha seleccionado ning\u00fan escudo.",
  invalidWarningText: "El archivo debe ser una imagen.",
  addUploadText: "Toc\u00e1 ac\u00e1 para agregar tu escudo.",
  changeUploadText: "Toc\u00e1 ac\u00e1 para cambiar tu escudo.",
  desktopAddUploadText: "Toc\u00e1 o arrastr\u00e1 tu escudo ac\u00e1.",
  desktopChangeUploadText: "Toc\u00e1 o arrastr\u00e1 para cambiar tu escudo."
};

function updateShieldVisualAsset(file) {
  if (visualAssetState.shield.previewUrl) {
    URL.revokeObjectURL(visualAssetState.shield.previewUrl);
  }

  const imageUrl = URL.createObjectURL(file);

  visualAssetState.shield.file = file;
  visualAssetState.shield.previewUrl = imageUrl;

  shieldUploadPreview.src = imageUrl;

  setAssetButtonIcons(
    [shieldButtonIcon, mobileShieldButtonIcon],
    imageUrl,
    { isUserUploadPreview: true }
  );
  syncShortLogoToggles();
  applyFrontShieldState();

  addShieldBtnText.textContent = "Cambiar Escudo";
  mobileAddShieldBtnText.textContent = "Cambiar Escudo";

  shieldUploadBox.classList.add("has-image");

  syncVisualAssetUploadText(shieldUploaderConfig);
}

shieldUploaderConfig.onFileSelected = updateShieldVisualAsset;
syncVisualAssetUploadText(shieldUploaderConfig);
setupVisualAssetDropZone(shieldUploaderConfig);

shieldUploadInput?.addEventListener("change", (event) => {

  const file = event.target.files?.[0];

  if (!file) return;

  updateShieldVisualAsset(file);

});

shieldDeleteBtn?.addEventListener("click", () => {

  if (!shieldUploadInput.files?.length && !visualAssetState.shield.file) return;

  if (visualAssetState.shield.previewUrl) {
    URL.revokeObjectURL(visualAssetState.shield.previewUrl);
  }

  visualAssetState.shield.file = null;
  visualAssetState.shield.previewUrl = "";

  shieldUploadInput.value = "";

  shieldUploadPreview.src = "";

  setAssetButtonIcons([shieldButtonIcon, mobileShieldButtonIcon], "./textures/icons/icon_escudo.png");
  syncShortLogoToggles();
  applyFrontShieldState();

  addShieldBtnText.textContent = "Agregar Escudo";
  mobileAddShieldBtnText.textContent = "Agregar Escudo";

  shieldUploadBox.classList.remove("has-image");

  syncVisualAssetUploadText(shieldUploaderConfig);
  shieldWarningPopup.textContent = shieldUploaderConfig.warningText;
  shieldWarningPopup.classList.remove("active");

});

shieldApplyBtn?.addEventListener("click", (event) => {
  event.stopPropagation();

  if (!shieldUploadInput.files?.length && !visualAssetState.shield.file) {
    shieldWarningPopup.textContent = shieldUploaderConfig.warningText;
    shieldWarningPopup.classList.add("active");
    return;
  }

  closeDesignPanelFn();
});

document.addEventListener("click", (event) => {

  if (!shieldWarningPopup.classList.contains("active")) return;

  const clickedPopup = shieldWarningPopup.contains(event.target);

  if (clickedPopup) {
    shieldWarningPopup.classList.remove("active");
    return;
  }

  const clickedApplyButton = shieldApplyBtn.contains(event.target);

  if (!clickedApplyButton) {
    shieldWarningPopup.classList.remove("active");
  }

});

setupVisualAssetUploader({
  stateKey: "sponsor",
  input: sponsorUploadInput,
  preview: sponsorUploadPreview,
  uploadBox: sponsorUploadBox,
  uploadText: sponsorUploadText,
  warningPopup: sponsorWarningPopup,
  applyButton: sponsorApplyBtn,
  deleteButton: sponsorDeleteBtn,
  triggerIcons: [sponsorButtonIcon, mobileSponsorButtonIcon],
  triggerLabels: [addSponsorBtnText, mobileAddSponsorBtnText],
  defaultIcon: "./textures/icons/icon_mas.png",
  addButtonText: "Agregar Sponsor",
  changeButtonText: "Cambiar Sponsor",
  addUploadText: "Toc\u00e1 ac\u00e1 para agregar tu sponsor.",
  changeUploadText: "Toc\u00e1 ac\u00e1 para cambiar tu sponsor.",
  desktopAddUploadText: "Toc\u00e1 o arrastr\u00e1 tu sponsor ac\u00e1.",
  desktopChangeUploadText: "Toc\u00e1 o arrastr\u00e1 para cambiar tu sponsor.",
  warningText: "No se ha seleccionado ning\u00fan sponsor.",
  invalidWarningText: "El archivo debe ser una imagen.",
  closePanel: closeSponsorPanelFn,
  onUpdate: applyFrontSponsorState,
  onClear: applyFrontSponsorState
});

setupVisualAssetUploader({
  stateKey: "backSponsor",
  input: backSponsorUploadInput,
  preview: backSponsorUploadPreview,
  uploadBox: backSponsorUploadBox,
  uploadText: backSponsorUploadText,
  warningPopup: backSponsorWarningPopup,
  applyButton: backSponsorApplyBtn,
  deleteButton: backSponsorDeleteBtn,
  triggerIcons: [backSponsorButtonIcon, mobileBackSponsorButtonIcon],
  triggerLabels: [backSponsorBtnText, mobileBackSponsorBtnText],
  defaultIcon: "./textures/icons/icon_mas.png",
  addButtonText: "Agregar Sponsor",
  changeButtonText: "Cambiar Sponsor",
  addUploadText: "Toc\u00e1 ac\u00e1 para agregar tu sponsor.",
  changeUploadText: "Toc\u00e1 ac\u00e1 para cambiar tu sponsor.",
  desktopAddUploadText: "Toc\u00e1 o arrastr\u00e1 tu sponsor ac\u00e1.",
  desktopChangeUploadText: "Toc\u00e1 o arrastr\u00e1 para cambiar tu sponsor.",
  warningText: "No se ha seleccionado ning\u00fan sponsor.",
  invalidWarningText: "El archivo debe ser una imagen.",
  closePanel: closeBackSponsorPanelFn,
  onUpdate: applyBackSponsorState,
  onClear: applyBackSponsorState
});

setSelectedDesign("sin-diseno");
setSelectedDorsalVariant("10");
setSelectedDorsalFont("ariq");
updateDorsalPreview();
syncInitialColorPreviews();
syncAllStrokePreviews();
const initialSharedDesignState = getSharedDesignStateFromUrl();
applySharedDesignState(initialSharedDesignState);
setupUnsavedChangesWarning();
setupConfiguratorAutosave({ skipRecoveryPrompt: hasSharedDesignStateInUrl() });
