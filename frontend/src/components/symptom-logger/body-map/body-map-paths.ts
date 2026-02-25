export interface BodyRegion {
  id: string;
  locationKey: string;
  label: string;
  side: "left" | "right" | "center";
  view: "front" | "back";
  d: string;
}

/**
 * SVG path definitions for each clickable body region.
 * viewBox: 0 0 200 440 (portrait body silhouette).
 * Left/Right are from the viewer's perspective (anatomical standard:
 * patient's left = viewer's right).
 *
 * Regions are split across front and back views.
 */
export const BODY_REGIONS: BodyRegion[] = [
  // ===================== FRONT VIEW =====================

  // --- Head subdivisions (front) ---
  {
    id: "forehead",
    locationKey: "forehead",
    label: "Forehead",
    side: "center",
    view: "front",
    d: "M83,2 Q83,0 100,0 Q117,0 117,2 L117,18 L83,18 Z",
  },
  {
    id: "left-temple",
    locationKey: "left_temple",
    label: "L Temple",
    side: "left",
    view: "front",
    d: "M117,8 L124,12 L124,28 L117,30 L117,8 Z",
  },
  {
    id: "right-temple",
    locationKey: "right_temple",
    label: "R Temple",
    side: "right",
    view: "front",
    d: "M83,8 L76,12 L76,28 L83,30 L83,8 Z",
  },
  {
    id: "jaw",
    locationKey: "jaw",
    label: "Jaw",
    side: "center",
    view: "front",
    d: "M83,30 L76,28 Q78,44 100,48 Q122,44 124,28 L117,30 Q115,42 100,44 Q85,42 83,30 Z",
  },

  // --- Neck (front) ---
  {
    id: "neck",
    locationKey: "neck",
    label: "Neck",
    side: "center",
    view: "front",
    d: "M90,48 L110,48 L112,65 L88,65 Z",
  },

  // --- Chest (front) ---
  {
    id: "chest",
    locationKey: "chest",
    label: "Chest",
    side: "center",
    view: "front",
    d: "M70,80 L130,80 L130,140 L70,140 Z",
  },

  // --- Abdomen (front) ---
  {
    id: "abdomen",
    locationKey: "abdomen",
    label: "Abdomen",
    side: "center",
    view: "front",
    d: "M72,140 L128,140 L125,215 L75,215 Z",
  },

  // --- Shoulders (front) ---
  {
    id: "left-shoulder",
    locationKey: "left_shoulder",
    label: "L Shoulder",
    side: "left",
    view: "front",
    d: "M130,65 L160,75 L155,95 L130,80 Z",
  },
  {
    id: "right-shoulder",
    locationKey: "right_shoulder",
    label: "R Shoulder",
    side: "right",
    view: "front",
    d: "M70,65 L40,75 L45,95 L70,80 Z",
  },

  // --- Left arm subdivisions (front) ---
  {
    id: "left-upper-arm",
    locationKey: "left_upper_arm",
    label: "L Upper Arm",
    side: "left",
    view: "front",
    d: "M155,95 L165,100 L167,145 L153,145 Z",
  },
  {
    id: "left-elbow",
    locationKey: "left_elbow",
    label: "L Elbow",
    side: "left",
    view: "front",
    d: "M153,145 L167,145 L168,162 L152,162 Z",
  },
  {
    id: "left-forearm",
    locationKey: "left_forearm",
    label: "L Forearm",
    side: "left",
    view: "front",
    d: "M152,162 L168,162 L170,192 L155,192 Z",
  },
  {
    id: "left-wrist",
    locationKey: "left_wrist",
    label: "L Wrist",
    side: "left",
    view: "front",
    d: "M155,192 L170,192 L170,202 L155,202 Z",
  },
  {
    id: "left-hand",
    locationKey: "left_hand",
    label: "L Hand",
    side: "left",
    view: "front",
    d: "M155,202 L170,202 L175,225 L160,228 L150,225 Z",
  },

  // --- Right arm subdivisions (front) ---
  {
    id: "right-upper-arm",
    locationKey: "right_upper_arm",
    label: "R Upper Arm",
    side: "right",
    view: "front",
    d: "M45,95 L35,100 L33,145 L47,145 Z",
  },
  {
    id: "right-elbow",
    locationKey: "right_elbow",
    label: "R Elbow",
    side: "right",
    view: "front",
    d: "M47,145 L33,145 L32,162 L48,162 Z",
  },
  {
    id: "right-forearm",
    locationKey: "right_forearm",
    label: "R Forearm",
    side: "right",
    view: "front",
    d: "M48,162 L32,162 L30,192 L45,192 Z",
  },
  {
    id: "right-wrist",
    locationKey: "right_wrist",
    label: "R Wrist",
    side: "right",
    view: "front",
    d: "M45,192 L30,192 L30,202 L45,202 Z",
  },
  {
    id: "right-hand",
    locationKey: "right_hand",
    label: "R Hand",
    side: "right",
    view: "front",
    d: "M45,202 L30,202 L25,225 L40,228 L50,225 Z",
  },

  // --- Hips (front) ---
  {
    id: "left-hip",
    locationKey: "left_hip",
    label: "L Hip",
    side: "left",
    view: "front",
    d: "M100,215 L130,215 L135,255 L105,255 Z",
  },
  {
    id: "right-hip",
    locationKey: "right_hip",
    label: "R Hip",
    side: "right",
    view: "front",
    d: "M70,215 L100,215 L95,255 L65,255 Z",
  },

  // --- Left leg subdivisions (front) ---
  {
    id: "left-thigh",
    locationKey: "left_thigh",
    label: "L Thigh",
    side: "left",
    view: "front",
    d: "M105,255 L135,255 L132,315 L108,315 Z",
  },
  {
    id: "left-knee",
    locationKey: "left_knee",
    label: "L Knee",
    side: "left",
    view: "front",
    d: "M108,315 L132,315 L131,338 L109,338 Z",
  },
  {
    id: "left-shin",
    locationKey: "left_shin",
    label: "L Shin",
    side: "left",
    view: "front",
    d: "M109,338 L131,338 L130,380 L110,380 Z",
  },

  // --- Right leg subdivisions (front) ---
  {
    id: "right-thigh",
    locationKey: "right_thigh",
    label: "R Thigh",
    side: "right",
    view: "front",
    d: "M65,255 L95,255 L92,315 L68,315 Z",
  },
  {
    id: "right-knee",
    locationKey: "right_knee",
    label: "R Knee",
    side: "right",
    view: "front",
    d: "M68,315 L92,315 L91,338 L69,338 Z",
  },
  {
    id: "right-shin",
    locationKey: "right_shin",
    label: "R Shin",
    side: "right",
    view: "front",
    d: "M69,338 L91,338 L90,380 L70,380 Z",
  },

  // --- Feet (front) ---
  {
    id: "left-foot",
    locationKey: "left_foot",
    label: "L Foot",
    side: "left",
    view: "front",
    d: "M110,380 L130,380 L135,410 L140,420 L130,425 L108,420 L105,410 Z",
  },
  {
    id: "right-foot",
    locationKey: "right_foot",
    label: "R Foot",
    side: "right",
    view: "front",
    d: "M70,380 L90,380 L95,410 L92,420 L70,425 L60,420 L65,410 Z",
  },

  // ===================== BACK VIEW =====================

  // --- Back of head ---
  {
    id: "back-of-head",
    locationKey: "back_of_head",
    label: "Back of Head",
    side: "center",
    view: "back",
    d: "M80,0 Q80,0 100,0 Q120,0 120,8 L120,36 Q120,42 100,44 Q80,42 80,36 L80,8 Z",
  },

  // --- Back of neck ---
  {
    id: "back-of-neck",
    locationKey: "back_of_neck",
    label: "Back of Neck",
    side: "center",
    view: "back",
    d: "M90,48 L110,48 L112,65 L88,65 Z",
  },

  // --- Shoulder blades ---
  {
    id: "left-shoulder-blade",
    locationKey: "left_shoulder_blade",
    label: "L Shoulder Blade",
    side: "left",
    view: "back",
    d: "M108,80 L130,80 L130,120 L108,120 Z",
  },
  {
    id: "right-shoulder-blade",
    locationKey: "right_shoulder_blade",
    label: "R Shoulder Blade",
    side: "right",
    view: "back",
    d: "M70,80 L92,80 L92,120 L70,120 Z",
  },

  // --- Back regions (3 horizontal bands) ---
  {
    id: "upper-back",
    locationKey: "upper_back",
    label: "Upper Back",
    side: "center",
    view: "back",
    d: "M72,120 L128,120 L128,155 L72,155 Z",
  },
  {
    id: "mid-back",
    locationKey: "mid_back",
    label: "Mid Back",
    side: "center",
    view: "back",
    d: "M74,155 L126,155 L125,185 L75,185 Z",
  },
  {
    id: "lower-back",
    locationKey: "lower_back",
    label: "Lower Back",
    side: "center",
    view: "back",
    d: "M75,185 L125,185 L125,215 L75,215 Z",
  },

  // --- Shoulders (back — reuse same position for clickability) ---
  // Shoulders on back view share front geometry so the outline stays coherent.
  // They are NOT separate from front shoulders; the back view shows shoulder
  // blades instead. Back shoulder regions are omitted to avoid duplication.

  // --- Glutes ---
  {
    id: "left-glute",
    locationKey: "left_glute",
    label: "L Glute",
    side: "left",
    view: "back",
    d: "M100,215 L130,215 L135,255 L105,255 Z",
  },
  {
    id: "right-glute",
    locationKey: "right_glute",
    label: "R Glute",
    side: "right",
    view: "back",
    d: "M70,215 L100,215 L95,255 L65,255 Z",
  },

  // --- Hamstrings (back of thigh) ---
  {
    id: "left-hamstring",
    locationKey: "left_hamstring",
    label: "L Hamstring",
    side: "left",
    view: "back",
    d: "M105,255 L135,255 L132,335 L108,335 Z",
  },
  {
    id: "right-hamstring",
    locationKey: "right_hamstring",
    label: "R Hamstring",
    side: "right",
    view: "back",
    d: "M65,255 L95,255 L92,335 L68,335 Z",
  },

  // --- Calves ---
  {
    id: "left-calf",
    locationKey: "left_calf",
    label: "L Calf",
    side: "left",
    view: "back",
    d: "M108,335 L132,335 L130,380 L110,380 Z",
  },
  {
    id: "right-calf",
    locationKey: "right_calf",
    label: "R Calf",
    side: "right",
    view: "back",
    d: "M68,335 L92,335 L90,380 L70,380 Z",
  },

  // --- Ankles ---
  {
    id: "left-ankle",
    locationKey: "left_ankle",
    label: "L Ankle",
    side: "left",
    view: "back",
    d: "M110,380 L130,380 L130,400 L110,400 Z",
  },
  {
    id: "right-ankle",
    locationKey: "right_ankle",
    label: "R Ankle",
    side: "right",
    view: "back",
    d: "M70,380 L90,380 L90,400 L70,400 Z",
  },
];

/** Non-interactive body outline silhouette for front view. */
export const FRONT_BODY_OUTLINE =
  "M100,0 Q120,0 120,8 L120,30 Q120,42 112,48 L112,65 L160,75 L165,100 L170,190 L175,225 L160,228 L150,225 L155,190 L155,95 L130,80 L130,215 L135,255 L130,380 L135,410 L140,420 L130,425 L108,420 L105,410 L110,380 L105,255 L100,215 L95,255 L90,380 L95,410 L92,420 L70,425 L60,420 L65,410 L70,380 L65,255 L70,215 L70,80 L45,95 L45,190 L50,225 L40,228 L25,225 L30,190 L35,100 L40,75 L88,65 L88,48 Q80,42 80,30 L80,8 Q80,0 100,0 Z";

/** Non-interactive body outline silhouette for back view (same symmetric shape). */
export const BACK_BODY_OUTLINE = FRONT_BODY_OUTLINE;

/** Filter regions for a given view. */
export function getRegionsForView(view: "front" | "back"): BodyRegion[] {
  return BODY_REGIONS.filter((r) => r.view === view);
}
