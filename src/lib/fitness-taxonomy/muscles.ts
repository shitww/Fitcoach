// ── Muscle Taxonomy ─────────────────────────────────────────────────────────
// Hierarchical muscle definitions for exercise classification, search, and
// future recommendation engines.
// ─────────────────────────────────────────────────────────────────────────────

/** Major muscle groups used for workout organization and filtering. */
export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'arms',
  'core',
  'legs',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

/** Individual muscles with precise anatomical naming.
 *  Used for primary/secondary muscle targeting in exercises.
 */
export const MUSCLES = [
  // Chest
  'pectoralis_major',
  'pectoralis_minor',
  // Back
  'latissimus_dorsi',
  'trapezius',
  'rhomboids',
  'erector_spinae',
  'teres_major',
  'teres_minor',
  'infraspinatus',
  // Shoulders
  'deltoid_anterior',
  'deltoid_lateral',
  'deltoid_posterior',
  'rotator_cuff',
  // Arms
  'biceps_brachii',
  'biceps_brachialis',
  'triceps_brachii',
  'triceps_lateral_head',
  'triceps_long_head',
  'triceps_medial_head',
  'brachioradialis',
  'forearm_flexors',
  'forearm_extensors',
  // Core
  'rectus_abdominis',
  'obliques',
  'transverse_abdominis',
  'hip_flexors',
  // Legs — anterior
  'quadriceps',
  'vastus_lateralis',
  'vastus_medialis',
  'vastus_intermedius',
  'rectus_femoris',
  // Legs — posterior
  'hamstrings',
  'biceps_femoris',
  'semitendinosus',
  'semimembranosus',
  'gluteus_maximus',
  'gluteus_medius',
  'gluteus_minimus',
  // Legs — lower
  'gastrocnemius',
  'soleus',
  'tibialis_anterior',
  // Hip / groin
  'hip_adductors',
  'hip_abductors',
  // Neck
  'sternocleidomastoid',
  'upper_traps',
  // Additional
  'serratus_anterior',
  'levator_scapulae',
  'tensor_fasciae_latae',
  'gracilis',
  'quadratus_lumborum',
] as const;

export type Muscle = (typeof MUSCLES)[number];

/** Muscle group → muscle membership mapping.
 *  Used for validation and UI grouping.
 */
export const MUSCLE_GROUP_MEMBERSHIP: Record<MuscleGroup, readonly Muscle[]> = {
  chest: ['pectoralis_major', 'pectoralis_minor'],
  back: [
    'latissimus_dorsi',
    'trapezius',
    'rhomboids',
    'erector_spinae',
    'teres_major',
    'teres_minor',
    'infraspinatus',
  ],
  shoulders: [
    'deltoid_anterior',
    'deltoid_lateral',
    'deltoid_posterior',
    'rotator_cuff',
  ],
  arms: [
    'biceps_brachii',
    'biceps_brachialis',
    'triceps_brachii',
    'triceps_lateral_head',
    'triceps_long_head',
    'triceps_medial_head',
    'brachioradialis',
    'forearm_flexors',
    'forearm_extensors',
  ],
  core: [
    'rectus_abdominis',
    'obliques',
    'transverse_abdominis',
    'hip_flexors',
  ],
  legs: [
    'quadriceps',
    'vastus_lateralis',
    'vastus_medialis',
    'vastus_intermedius',
    'rectus_femoris',
    'hamstrings',
    'biceps_femoris',
    'semitendinosus',
    'semimembranosus',
    'gluteus_maximus',
    'gluteus_medius',
    'gluteus_minimus',
    'gastrocnemius',
    'soleus',
    'tibialis_anterior',
    'hip_adductors',
    'hip_abductors',
  ],
} as const;

/** Human-readable labels for muscles (EN + CN for bilingual support). */
export const MUSCLE_LABELS: Record<Muscle, { en: string; cn: string }> = {
  pectoralis_major: { en: 'Pectoralis Major', cn: '胸大肌' },
  pectoralis_minor: { en: 'Pectoralis Minor', cn: '胸小肌' },
  latissimus_dorsi: { en: 'Latissimus Dorsi', cn: '背阔肌' },
  trapezius: { en: 'Trapezius', cn: '斜方肌' },
  rhomboids: { en: 'Rhomboids', cn: '菱形肌' },
  erector_spinae: { en: 'Erector Spinae', cn: '竖脊肌' },
  teres_major: { en: 'Teres Major', cn: '大圆肌' },
  teres_minor: { en: 'Teres Minor', cn: '小圆肌' },
  infraspinatus: { en: 'Infraspinatus', cn: '冈下肌' },
  deltoid_anterior: { en: 'Anterior Deltoid', cn: '前三角肌' },
  deltoid_lateral: { en: 'Lateral Deltoid', cn: '中三角肌' },
  deltoid_posterior: { en: 'Posterior Deltoid', cn: '后三角肌' },
  rotator_cuff: { en: 'Rotator Cuff', cn: '肩袖肌群' },
  biceps_brachii: { en: 'Biceps Brachii', cn: '肱二头肌' },
  biceps_brachialis: { en: 'Brachialis', cn: '肱肌' },
  triceps_brachii: { en: 'Triceps Brachii', cn: '肱三头肌' },
  triceps_lateral_head: { en: 'Triceps Lateral Head', cn: '肱三头肌外侧头' },
  triceps_long_head: { en: 'Triceps Long Head', cn: '肱三头肌长头' },
  triceps_medial_head: { en: 'Triceps Medial Head', cn: '肱三头肌内侧头' },
  brachioradialis: { en: 'Brachioradialis', cn: '肱桡肌' },
  forearm_flexors: { en: 'Forearm Flexors', cn: '前臂屈肌' },
  forearm_extensors: { en: 'Forearm Extensors', cn: '前臂伸肌' },
  rectus_abdominis: { en: 'Rectus Abdominis', cn: '腹直肌' },
  obliques: { en: 'Obliques', cn: '腹外斜肌' },
  transverse_abdominis: { en: 'Transverse Abdominis', cn: '腹横肌' },
  hip_flexors: { en: 'Hip Flexors', cn: '髋屈肌' },
  quadriceps: { en: 'Quadriceps', cn: '股四头肌' },
  vastus_lateralis: { en: 'Vastus Lateralis', cn: '股外侧肌' },
  vastus_medialis: { en: 'Vastus Medialis', cn: '股内侧肌' },
  vastus_intermedius: { en: 'Vastus Intermedius', cn: '股中间肌' },
  rectus_femoris: { en: 'Rectus Femoris', cn: '股直肌' },
  hamstrings: { en: 'Hamstrings', cn: '腘绳肌' },
  biceps_femoris: { en: 'Biceps Femoris', cn: '股二头肌' },
  semitendinosus: { en: 'Semitendinosus', cn: '半腱肌' },
  semimembranosus: { en: 'Semimembranosus', cn: '半膜肌' },
  gluteus_maximus: { en: 'Gluteus Maximus', cn: '臀大肌' },
  gluteus_medius: { en: 'Gluteus Medius', cn: '臀中肌' },
  gluteus_minimus: { en: 'Gluteus Minimus', cn: '臀小肌' },
  gastrocnemius: { en: 'Gastrocnemius', cn: '腓肠肌' },
  soleus: { en: 'Soleus', cn: '比目鱼肌' },
  tibialis_anterior: { en: 'Tibialis Anterior', cn: '胫骨前肌' },
  hip_adductors: { en: 'Hip Adductors', cn: '髋内收肌' },
  hip_abductors: { en: 'Hip Abductors', cn: '髋外展肌' },
  sternocleidomastoid: { en: 'Sternocleidomastoid', cn: '胸锁乳突肌' },
  upper_traps: { en: 'Upper Traps', cn: '上斜方肌' },
  serratus_anterior: { en: 'Serratus Anterior', cn: '前锯肌' },
  levator_scapulae: { en: 'Levator Scapulae', cn: '肩胛提肌' },
  tensor_fasciae_latae: { en: 'Tensor Fasciae Latae', cn: '阔筋膜张肌' },
  gracilis: { en: 'Gracilis', cn: '股薄肌' },
  quadratus_lumborum: { en: 'Quadratus Lumborum', cn: '腰方肌' },
};

/** Muscle group human-readable labels. */
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, { en: string; cn: string }> = {
  chest: { en: 'Chest', cn: '胸部' },
  back: { en: 'Back', cn: '背部' },
  shoulders: { en: 'Shoulders', cn: '肩部' },
  arms: { en: 'Arms', cn: '手臂' },
  core: { en: 'Core', cn: '核心' },
  legs: { en: 'Legs', cn: '腿部' },
};
