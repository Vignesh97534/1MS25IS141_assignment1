import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON with generous limit for PDF base64 payloads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Built-in sample papers for instant testing and demonstration
const SAMPLE_PAPERS = [
  {
    id: 'sample-ml-healthcare',
    title: 'Deep Learning with Convolutional Attention Networks for Multi-Class Diabetic Retinopathy Grading and Lesion Localization',
    authors: 'Dr. Sarah Lin, Prof. Marcus Vance, Elena Rostova et al. (Stanford Medical AI Lab)',
    domain: 'Machine Learning & Healthcare',
    year: '2024',
    summarySnippet: 'Evaluates dual-branch vision transformers and convolutional attention on 145,000 retinal fundus images for clinical grading and microvascular lesion segmentation.',
    fullText: `Title: Deep Learning with Convolutional Attention Networks for Multi-Class Diabetic Retinopathy Grading and Lesion Localization
Authors: Sarah Lin, Marcus Vance, Elena Rostova, David K. Chen
Affiliation: Department of Biomedical Informatics, Stanford University School of Medicine
Journal of Medical AI & Ophthalmology (2024)

Abstract:
Diabetic retinopathy (DR) affects approximately 27% of diabetic individuals and is the leading cause of vision loss among working-age adults. Current automated screening algorithms predominantly frame DR detection as a binary classification problem (referable vs. non-referable), which is insufficient for clinical staging and treatment planning (such as anti-VEGF therapy versus panretinal photocoagulation). In this study, we introduce RetinaAttnNet, a hybrid convolutional and spatial-channel attention architecture designed for 5-stage DR classification according to the International Clinical Diabetic Retinopathy (ICDR) scale: No DR, Mild, Moderate, Severe, and Proliferative DR. Using a curated dataset of 145,210 high-resolution digital fundus photographs aggregated from five diverse hospital networks (EyePACS, Messidor-2, APTOS, and two regional Asian health cohorts), RetinaAttnNet was trained with ordinal focal loss and self-supervised contrastive pre-training. Across independent multi-ethnic testing cohorts (n = 22,480), the proposed network achieved a quadratic weighted Cohen's kappa (κ) of 0.894 (95% CI: 0.887–0.901) and an overall multi-class AUC of 0.962. For referable DR (Moderate or worse), sensitivity was 96.8% and specificity was 94.2%, outperforming the average diagnostic performance of six board-certified retinal specialists (sensitivity 91.5%, specificity 93.1%). Furthermore, integrated gradient-based saliency mapping accompanied by bounding box bounding of microaneurysms, hemorrhages, hard exudates, and cotton wool spots attained an intersection-over-union (mIoU) of 0.724 against expert pixel-level annotations. Our findings indicate that combining hierarchical convolutional feature extraction with multi-head spatial self-attention yields clinically viable multi-class grading with explainable lesion-level visual grounding.

1. Introduction & Research Problem:
Global diabetic prevalence has surpassed 537 million adults, placing an unsustainable burden on ophthalmology healthcare infrastructures. Regular annual fundus screening is clinically proven to prevent 90% of severe vision loss through early intervention. However, in low- and middle-income countries, the patient-to-retinal-specialist ratio frequently exceeds 250,000:1. Existing commercial automated screening systems suffer from two core shortcomings:
1. Coarse Binary Triage: They merely separate "normal" from "referable" cases without distinguishing between stages that require urgent surgical intervention (Proliferative DR) versus lifestyle modification and glycemic control (Mild/Moderate non-proliferative DR).
2. Diagnostic Opacity: Deep neural networks routinely behave as uninterpretable black boxes, leading to skepticism among attending clinicians when AI recommendations contradict manual grading.

2. Research Objectives:
The specific goals of this study were:
- Objective 1: Develop an end-to-end ordinal multi-class classification model that maps fundus imagery directly to the 5 standard ICDR disease stages.
- Objective 2: Formulate a dual-task objective combining global category predictions with pixel-level lesion localization to provide verifiable spatial explanations for clinicians.
- Objective 3: Evaluate model robustness across diverse ethnic populations, varied camera models (Topcon, Canon, Zeiss), and degraded image quality scenarios.

3. Methodology & System Architecture:
- Data Cohort: 145,210 color fundus images from 42,100 unique patients. Annotations were performed by an international panel of 18 ophthalmologists using a consensus triple-reading protocol.
- Architecture: RetinaAttnNet incorporates a ResNet-101 convolutional stem coupled with four cross-scale Swin-Transformer attention blocks. Spatial attention identifies suspect retinal quadrants while channel attention highlights subtle microaneurysm contrast variations.
- Loss Function: An ordinal cross-entropy loss weighted by focal factors to penalize large ordinal rank deviations (e.g., misclassifying Proliferative DR as Mild DR incurs tenfold higher loss than misclassifying it as Severe DR).
- Hardware & Training: Distributed across 8 NVIDIA A100 GPUs (80GB) using PyTorch 2.1, mixed precision (FP16), AdamW optimizer, and Cosine Annealing learning rate schedule.

4. Key Findings:
1. Superior Diagnostic Concordance: RetinaAttnNet attained a quadratic weighted kappa of 0.894 across multi-center test sets, compared to 0.832 for baseline DenseNet-121 and 0.849 for standard Vision Transformer (ViT-B/16).
2. Human-Level Staging Accuracy: On Proliferative DR (the highest risk category), the model achieved 98.1% sensitivity at 97.4% specificity, preventing dangerous false negatives.
3. Lesion Interpretability: Heatmaps accurately highlighted 92.4% of clinically verified microaneurysms and 88.7% of neovascularization fronds without requiring manual segmentations at test time.
4. Resilience to Sensor Artifacts: Under simulated blur, under-exposure, and cataract opacity (up to 30% contrast degradation), classification accuracy degraded by only 4.2%, compared to 17.8% in baseline ResNet models.

5. Limitations:
1. Computational Footprint: RetinaAttnNet contains 86 million parameters, requiring edge hardware acceleration (such as NVIDIA Jetson or dedicated NPUs) for field deployment in remote battery-powered clinics.
2. Ultrawide-field & Peripheral DR: The system was validated primarily on 45-degree and 50-degree macula-centered fundus photographs; peripheral diabetic lesions in ultrawide-field (UWF) photography remain outside the current domain.
3. Lack of Volumetric Depth: Color photography cannot measure retinal thickness or intraretinal fluid pockets, which requires Optical Coherence Tomography (OCT).

6. Future Scope:
1. Multi-modal fusion integrating optical coherence tomography (OCT) and optical coherence tomography angiography (OCTA) scans.
2. Prospective clinical trial deployed in 30 primary health care clinics across rural India and Kenya to assess patient adherence and referral follow-up rates.
3. Integration of patient demographic risk factors (HbA1c levels, duration of diabetes, systolic blood pressure) into a Bayesian neural network for longitudinal disease progression forecasting.`
  },
  {
    id: 'sample-renewable-energy',
    title: 'Interfacial Charge-Transfer Dynamics and Halide Stabilization in High-Efficiency Perovskite-Silicon Tandem Photovoltaics',
    authors: 'Prof. Julian Weber, Dr. Maya Al-Hassan, Carlos Mendez et al. (Fraunhofer Institute for Solar Energy)',
    domain: 'Renewable Energy & Materials Science',
    year: '2024',
    summarySnippet: 'Investigates self-assembled carbazole monolayers and fluorinated guanidinium passivators to eliminate non-radiative recombination in 31.4% efficient perovskite-silicon tandems.',
    fullText: `Title: Interfacial Charge-Transfer Dynamics and Halide Stabilization in High-Efficiency Perovskite-Silicon Tandem Photovoltaics
Authors: Julian Weber, Maya Al-Hassan, Carlos Mendez, Hiroshi Tanaka, Sophia Lindqvist
Affiliation: Fraunhofer Institute for Solar Energy Systems ISE, Freiburg, Germany
Nature Energy Materials (2024)

Abstract:
Monolithic two-terminal (2T) perovskite-silicon tandem solar cells represent the most economically promising route to transcend the Shockley-Queisser theoretical efficiency limit of silicon single-junction photovoltaics (~29.4%). However, operational stability under continuous illumination, thermal stress, and moisture exposure remains the critical impediment to commercial industrialization. In this work, we demonstrate an interfacial engineering strategy that concurrently passivates both deep-level point defects and grain-boundary dangling bonds in wide-bandgap (1.68 eV) metal halide perovskite top absorbers. By incorporating a novel fluorinated phosphonic acid self-assembled monolayer (F-2PACz) at the hole-selective interface and a trifluoroethylammonium iodide (TFEAI) molecular surface capping layer, we suppress non-radiative interfacial recombination by 78%. When integrated onto commercially textured n-type silicon heterojunction (SHJ) bottom cells with tuned rear-reflector silver-palladium grids, the monolithic tandem delivers a certified power conversion efficiency (PCE) of 31.42% under standard AM1.5G solar illumination with an open-circuit voltage (Voc) of 1.954 V and fill factor (FF) of 82.1%. In-situ photoluminescence mapping and grazing-incidence wide-angle X-ray scattering (GIWAXS) confirm that the fluorinated surface architecture prevents phase segregation into iodine-rich and bromine-rich domains under continuous 1-sun equivalent illumination at 65°C. Crucially, encapsulated tandem modules maintained 96.4% of their initial performance after 1,500 hours of continuous maximum power point (MPPT) tracking under accelerated ISOS-L-2 indoor testing standards, demonstrating a clear path toward 25-year operational warranties.

1. Introduction & Research Problem:
Global energy transition imperatives necessitate rapid reductions in the levelized cost of electricity (LCOE) for solar photovoltaics. Standard crystalline silicon wafer technology, while mature and cost-effective, is approaching asymptotic efficiency plateaus. Perovskite-silicon tandems resolve this bottleneck by splitting the solar spectrum: the perovskite absorbs high-energy blue/green photons, while the underlying silicon cell captures lower-energy near-infrared photons.
Despite reaching laboratory PCE records exceeding 30%, two major scientific bottlenecks persist:
1. Interfacial Recombination Loss: Hole-extraction interfaces between the wide-bandgap perovskite and transparent conductive oxides (TCO) harbor significant defect density, creating a quasi-Fermi level splitting (QFLS) deficit of up to 180 mV.
2. Photo-Induced Phase Segregation (Hoke Effect): Under operational light soaking and elevated ambient temperatures, mixed-halide perovskites (I/Br) spontaneously dissociate into low-bandgap iodide clusters that act as catastrophic carrier trapping centers.

2. Research Objectives:
- Objective 1: Synthesize and characterize a fluorinated self-assembled monolayer (F-2PACz) that optimizes energetic band alignment and dipole orientation at the hole-transport layer.
- Objective 2: Inhibit photo-induced iodide-bromide phase segregation via molecular surface capping with hydrophobic fluorinated cations.
- Objective 3: Fabricate fully textured industrial-sized tandem cells exceeding 31% power conversion efficiency with verified ISOS-compliant long-term photothermal stability.

3. Methodology & Experimental Framework:
- Device Structure: Monolithic 2T architecture: Glass / ITO / F-2PACz / Cs0.05(FA0.85MA0.15)0.95Pb(I0.80Br0.20)3 / TFEAI passivator / C60 electron transport / SnO2 atomic layer deposition (ALD) / IZO recombination layer / Textured Silicon Heterojunction bottom cell / Ag contact.
- Spectroscopy: Time-resolved photoluminescence (TRPL) to calculate carrier lifetimes; Transient Absorption (TA) spectroscopy for picosecond charge transfer kinetics; In-situ GIWAXS during heating cycles.
- Stability Testing: Continuous 1-sun equivalent LED illumination, calibrated silicon reference diodes, temperature-controlled chuck maintained at 65°C ± 2°C with nitrogen purge and hermetic butyl-edge glass encapsulation.

4. Key Findings:
1. Certified Efficiency Record: The monolithic tandem achieved 31.42% certified PCE (aperture area 1.04 cm²), characterized by Voc = 1.954 V, Jsc = 19.58 mA/cm², and FF = 82.1%, establishing a new benchmark for textured bottom architectures.
2. Suppressed Carrier Recombination: TRPL showed carrier lifetime increased from 420 ns in unpassivated films to 3,210 ns in F-2PACz/TFEAI treated layers, approaching the radiative radiative recombination limit.
3. Elimination of the Hoke Effect: GIWAXS and PL spectra exhibited zero phase segregation shifts after 500 hours of continuous light soaking at 65°C, confirming that fluorinated bonds arrest halide ion migration.
4. Operational Longevity: Encapsulated tandems survived 1,500 hours of continuous 1-sun MPPT tracking with less than 3.6% relative degradation (meeting ISOS-L-2 guidelines).

5. Limitations:
1. Upscaling Losses: Small-aperture laboratory cells (1.04 cm²) experience resistance bottlenecks when scaled to commercial wafer formats (M10/G12 sizes, 240+ cm²), requiring improved grid metallization.
2. Hazardous Lead Content: The presence of water-soluble lead (Pb) halides poses regulatory compliance hurdles under European RoHS directives in the event of severe hail damage.
3. Vacuum Capital Expenditure: The need for atomic layer deposition (SnO2) and thermal evaporation (C60, metal contacts) increases upfront capital equipment expense compared to simple screen-printing.

6. Future Scope:
1. Development of high-throughput slot-die coating and blade-coating protocols for ambient roll-to-roll or sheet-to-sheet fabrication.
2. Chemical substitution exploring lead-tin (Pb-Sn) or double perovskite bismuth-based non-toxic compounds.
3. Bifacial tandem architecture design to capture albedo ground reflections (10–25% extra yield) in field utility installations.`
  },
  {
    id: 'sample-transformer-nlp',
    title: 'Attention Is All You Need: Scalable Multi-Head Attention for Sequence-to-Sequence Modeling',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit et al. (Google Brain & Google Research)',
    domain: 'Computer Science & Natural Language Processing',
    year: '2017',
    summarySnippet: 'Proposes the Transformer architecture, replacing recurrent and convolutional architectures entirely with multi-head self-attention mechanisms.',
    fullText: `Title: Attention Is All You Need
Authors: Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Łukasz Kaiser, Illia Polosukhin
Affiliation: Google Brain, Google Research, University of Toronto
Advances in Neural Information Processing Systems (NeurIPS 2017)

Abstract:
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The most competitive models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train. Our model achieves 28.4 BLEU on the WMT 2014 English-to-German translation task, improving over the existing best results, including ensembles, by over 2 BLEU. On the WMT 2014 English-to-French translation task, our model establishes a new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs, a small fraction of the training costs of the best models from the literature. We show that the Transformer generalizes well to other tasks by applying it successfully to English constituency parsing with large and limited training data.

1. Introduction & Research Problem:
Recurrent neural networks, notably LSTM (Long Short-Term Memory) and GRU (Gated Recurrent Unit), have been established as state-of-the-art approaches in sequence modeling. Recurrent models inherently compute representations sequentially along the symbol positions of input and output sequences. This sequential nature precludes parallelization within training examples, which becomes critical at longer sequence lengths, as memory constraints limit batching across examples.
Furthermore, in RNNs, the number of operations required to relate signals from two arbitrary input and output positions grows linearly with distance (O(N)), making it difficult for the network to learn long-range temporal dependencies.

2. Research Objectives:
- Objective 1: Eliminate sequential recurrent connections and convolutional inductive biases in sequence transduction architectures.
- Objective 2: Formulate Multi-Head Scaled Dot-Product Attention capable of connecting arbitrary positions in constant O(1) sequential operations.
- Objective 3: Significantly accelerate training throughput by enabling full parallelization across sequence tokens.
- Objective 4: Establish new state-of-the-art BLEU scores on standard WMT 2014 machine translation benchmarks.

3. Methodology & Model Architecture:
- Architecture: An encoder-decoder structure consisting of stacked self-attention and point-wise fully connected feed-forward layers.
- Multi-Head Attention: Projects queries, keys, and values h times with different learned linear projections to dk, dk, and dv dimensions. Attention is computed as softmax((Q * K^T) / sqrt(dk)) * V, allowing the model to attend to information from different representation subspaces simultaneously.
- Positional Encoding: Since the model contains no recurrence and no convolution, sine and cosine functions of different frequencies are injected into input embeddings to supply positional order.
- Regularization: Residual dropout, label smoothing (epsilon = 0.1), and layer normalization applied after every sub-layer.
- Training Setup: Trained on 8 NVIDIA P100 GPUs using the Byte-Pair Encoding (BPE) vocabulary and Adam optimizer with a warm-up learning rate schedule.

4. Key Findings:
1. Translation Quality Leap: Transformer (big) achieved 28.4 BLEU on WMT 2014 English-to-German, outperforming previous ensemble models by over 2.0 BLEU. On English-to-French, it reached 41.8 BLEU.
2. Drastic Training Speedup: The base Transformer was trained in 12 hours on 8 P100 GPUs, requiring only 3.3 x 10^18 FLOPs—orders of magnitude faster than recurrent GNMT or ByteNet architectures.
3. Long-Distance Information Flow: Maximum path length between any two tokens is reduced to O(1), enabling rapid gradient propagation and seamless resolution of subject-verb agreements across long paragraphs.
4. Parsing Generalization: Without task-specific tuning, the 4-layer Transformer achieved 92.7 F1 on the Penn Treebank constituency parsing dataset.

5. Limitations:
1. Quadratic Complexity: Standard self-attention exhibits quadratic computational and memory complexity (O(N^2)) with respect to sequence length N, constraining context windows on very long documents.
2. Data Hunger: Lacks inductive biases present in CNNs (spatial locality) or RNNs (sequential ordering); requires massive training corpora to converge effectively.
3. Interpretability of Cross-Attentions: While individual attention heads often specialize in syntax or coreference, aggregate predictions across 96+ heads remain difficult to deconstruct for safety-critical tasks.

6. Future Scope:
1. Sub-quadratic or linear attention mechanisms (such as Sparse Transformers, Reformer, or Performer) to process megabyte-scale documents.
2. Pre-training on massive unannotated text corpora via masked language modeling (which paved the way for BERT and GPT).
3. Adaptation of multi-head attention to vision, speech, and multimodal audio-visual transformers.`
  }
];

// Helper: Few-Shot Prompt Builder
function buildFewShotPrompt(paperText: string, paperTitle?: string): string {
  return `You are ResearchMate, a distinguished AI research analyst and academic peer-reviewer. Your mission is to thoroughly evaluate the provided research paper and generate an exhaustive, structured academic analysis specifically tailored to help students, researchers, and scholars grasp its core scientific contributions.

### FEW-SHOT EXAMPLES OF DESIRED OUTPUT STRUCTURE:

---
### FEW-SHOT EXAMPLE 1: MACHINE LEARNING IN HEALTHCARE
[Input Paper excerpt]: Deep neural network ensemble for automated detection of diabetic retinopathy from 128,175 fundus images, comparing ResNet and EfficientNet against 54 ophthalmologists.
[Output Structure]:
- Summary: The authors propose a deep convolutional network ensemble to detect referable diabetic retinopathy from digital color fundus photographs, achieving diagnostic performance rivaling certified ophthalmologists and enabling scalable community tele-screening.
- Research Problem: Diabetic retinopathy (DR) is a leading cause of preventable blindness worldwide, but conventional screening requires trained retinal specialists, creating severe backlogs and unequal access in low-resource clinics.
- Research Objectives:
  1. Develop and validate a deep learning model to classify fundus images as referable DR (moderate or worse DR, or diabetic macular edema).
  2. Benchmark model sensitivity and specificity against an international panel of 54 US-licensed ophthalmologists.
- Methodology:
  - Architecture & Setup: Pretrained ResNet-50 and EfficientNet architectures fine-tuned with stochastic gradient descent and focal loss to address class imbalance.
  - Dataset: 128,175 retinal images from clinical cohorts, adjudicated by multiple retinal specialists for ground truth grading.
  - Evaluation: ROC curves, AUC, sensitivity, specificity, and Cohen's kappa coefficients across separate multi-ethnic validation cohorts.
- Key Findings:
  1. Achieved an AUC of 0.991 (95% CI: 0.988–0.993) on the EyePACS-1 validation set.
  2. Attained 97.5% sensitivity and 93.4% specificity, exceeding the minimum clinical benchmark (80% sensitivity / 80% specificity).
  3. Demonstrated robust cross-dataset generalization on the independent Messidor-2 dataset with an AUC of 0.990.
- Limitations:
  1. Black-box interpretability: Saliency heatmaps do not always correspond to subtle microaneurysm pathology.
  2. Model sensitivity degrades on poor-quality images (undilated pupils, media opacities such as cataracts).
  3. Tested in retrospective cohorts; real-world prospective deployment workflows were not evaluated.
- Future Research Scope:
  1. Prospective randomized clinical trial testing real-world deployment in rural health centers.
  2. Integration of optical coherence tomography (OCT) volumetric scans alongside 2D fundus photography.
  3. Federated learning to train on hospital records without centralized patient data sharing.

---
### FEW-SHOT EXAMPLE 2: RENEWABLE ENERGY & PHOTOVOLTAICS
[Input Paper excerpt]: Interfacial passivation kinetics in monolithic perovskite-silicon tandem solar cells using fluorinated carbazole self-assembled monolayers (2PACz) to prevent phase segregation.
[Output Structure]:
- Summary: This paper demonstrates an engineered 2D/3D perovskite-silicon tandem solar cell utilizing a fluorinated carbazole self-assembled monolayer (2PACz) that minimizes interfacial defect recombination, achieving 31.2% certified power conversion efficiency.
- Research Problem: Silicon single-junction solar cells approach their theoretical Shockley-Queisser limit of ~29.4%, while perovskite-silicon tandems suffer from interfacial non-radiative recombination and moisture-induced phase segregation, restricting commercial viability.
- Research Objectives:
  1. Synthesize and evaluate fluorinated self-assembled monolayer hole-transport interfaces.
  2. Inhibit halide segregation under continuous 1-sun illumination at elevated temperatures (65°C).
  3. Surpass the 30% power conversion efficiency milestone with long-term operational stability.
- Methodology:
  - Materials & Architecture: Wide-bandgap Cs0.05FA0.85MA0.10Pb(I0.83Br0.17)3 top cells deposited atop textured silicon heterojunction bottom cells.
  - Characterization: Photoluminescence quantum yield (PLQY), transient absorption spectroscopy, Grazing-Incidence Wide-Angle X-ray Scattering (GIWAXS), and ISOS-L-1 operational stability tests.
- Key Findings:
  1. Achieved certified power conversion efficiency of 31.25% with an open-circuit voltage (Voc) of 1.94 V.
  2. Quasi-Fermi level splitting increased by 65 meV due to suppressed defect state density at the hole-selective contact.
  3. Retained 95% of initial efficiency after 1,200 hours of continuous maximum power point tracking under 1-sun illumination at 60°C.
- Limitations:
  1. Contains lead (Pb), raising eco-toxicity compliance issues for large-scale manufacturing.
  2. Vacuum evaporation of buffer layers increases fabrication capital expenditure compared to solution processing.
  3. Scaled modules (>100 cm²) exhibit higher serial resistance losses than small laboratory cells (1 cm²).
- Future Research Scope:
  1. Lead-free or tin-lead low-toxicity perovskite tandem alternatives.
  2. Roll-to-roll slot-die coating techniques for industrial scale manufacturing.
  3. Accelerated indoor damp-heat testing (85°C / 85% RH) following IEC 61215 standards.

---
### INSTRUCTIONS FOR ANALYZING THE TARGET PAPER:
Apply the EXACT SAME rigorous structured analysis to the target research paper provided below.
Ensure you address all requested components with high academic fidelity:
1. Paper Title, Authors/Institution (if identifiable), Field/Discipline, and Publication Year.
2. Executive Summary: A lucid, high-impact summary covering the core problem, solution, and implications.
3. Research Problem: The fundamental scientific/technical gap, why existing methods fail, and societal or domain significance.
4. Research Objectives: Explicit numbered research questions, hypotheses, or milestones.
5. Methodology: Comprehensive breakdown of experimental setup, architecture, datasets, baselines, and evaluation protocols. Also provide a step-by-step workflow (4-6 sequential steps).
6. Key Findings: Quantifiable results, metrics, benchmarks, and breakthroughs.
7. Limitations: Technical constraints, unaddressed edge cases, sample biases, and scalability bottlenecks.
8. Future Research Scope: Specific concrete avenues for future exploration and follow-up investigations.
9. Student Glossary: 4 to 6 technical terms or formulas from the paper explained in simple terms for a student.
10. Study Quiz / Comprehension Check: 3 multiple-choice or conceptual check questions with answers to help students test their understanding.

TARGET RESEARCH PAPER:
${paperTitle ? `Title Hint: ${paperTitle}\n` : ''}
${paperText.slice(0, 75000)}
`;
}

// Response Schema for structured JSON
const analysisResponseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'Academic paper title' },
    authors: { type: Type.STRING, description: 'Authors and affiliations' },
    field: { type: Type.STRING, description: 'Primary academic discipline or field of study' },
    year: { type: Type.STRING, description: 'Year or date of publication' },
    summary: { type: Type.STRING, description: 'Rigorous executive summary of the paper' },
    researchProblem: { type: Type.STRING, description: 'The core research problem and gap in literature' },
    researchObjectives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of specific research objectives and hypotheses'
    },
    methodology: {
      type: Type.OBJECT,
      properties: {
        overview: { type: Type.STRING, description: 'Overview of methodology and experimental design' },
        datasetOrMaterials: { type: Type.STRING, description: 'Datasets, sample sizes, or materials utilized' },
        systemArchitecture: { type: Type.STRING, description: 'Model architecture, algorithms, or experimental setup' },
        evaluationMetrics: { type: Type.STRING, description: 'Evaluation metrics, statistical controls, or benchmarks' },
        workflowSteps: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              stepNumber: { type: Type.INTEGER },
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ['stepNumber', 'title', 'description']
          },
          description: 'Step-by-step methodology workflow'
        }
      },
      required: ['overview', 'datasetOrMaterials', 'systemArchitecture', 'evaluationMetrics', 'workflowSteps']
    },
    keyFindings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: 'Brief finding headline or metric' },
          detail: { type: Type.STRING, description: 'In-depth explanation and statistical evidence' }
        },
        required: ['headline', 'detail']
      },
      description: 'Key empirical findings, metrics, and discoveries'
    },
    limitations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, description: 'e.g., Generalizability, Data Bias, Computational, Theoretical' },
          description: { type: Type.STRING, description: 'Description of the limitation' }
        },
        required: ['category', 'description']
      },
      description: 'Key limitations and threats to validity acknowledged or deduced'
    },
    futureResearchScope: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          area: { type: Type.STRING, description: 'Future research direction title' },
          recommendation: { type: Type.STRING, description: 'Concrete proposal or experiment' }
        },
        required: ['area', 'recommendation']
      },
      description: 'Future research directions and unexplored questions'
    },
    glossary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          term: { type: Type.STRING },
          definition: { type: Type.STRING, description: 'Clear student-friendly explanation' }
        },
        required: ['term', 'definition']
      },
      description: 'Key technical terms and definitions'
    },
    studyQuiz: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctOptionIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ['question', 'options', 'correctOptionIndex', 'explanation']
      },
      description: 'Student comprehension questions'
    }
  },
  required: [
    'title',
    'field',
    'summary',
    'researchProblem',
    'researchObjectives',
    'methodology',
    'keyFindings',
    'limitations',
    'futureResearchScope',
    'glossary',
    'studyQuiz'
  ]
};

// Sample pre-computed structured analyses matching few-shot outputs
const SAMPLE_ANALYSES: Record<string, any> = {
  'sample-ml-healthcare': {
    title: 'Deep Learning with Convolutional Attention Networks for Multi-Class Diabetic Retinopathy Grading and Lesion Localization',
    authors: 'Dr. Sarah Lin, Prof. Marcus Vance, Elena Rostova, David K. Chen (Stanford Medical AI Lab)',
    field: 'Medical AI & Ophthalmology',
    year: '2024',
    summary: 'The authors propose RetinaAttnNet, a hybrid convolutional and spatial-channel attention architecture designed for 5-stage diabetic retinopathy (DR) classification on the International Clinical Diabetic Retinopathy (ICDR) scale. Evaluated on 145,210 retinal fundus images across five international hospital cohorts, the model achieves a quadratic weighted Cohen\'s kappa of 0.894 and an AUC of 0.962, surpassing the diagnostic sensitivity of certified retinal specialists while providing pixel-level lesion localization heatmaps for clinical explainability.',
    researchProblem: 'Diabetic retinopathy affects over 140 million people globally, leading to preventable blindness if left untreated. Existing automated triage models rely on simplistic binary classification (referable vs. non-referable) without distinguishing surgical proliferative stages from manageable non-proliferative stages. Furthermore, deep neural networks often suffer from "black-box opacity", creating trust deficits among ophthalmologists.',
    researchObjectives: [
      'Formulate an ordinal multi-class deep architecture mapping fundus images directly into the 5 standard ICDR disease stages.',
      'Incorporate dual-branch spatial and channel self-attention to generate clinically verifiable lesion heatmaps for microaneurysms and hemorrhages.',
      'Evaluate model robustness and generalization across multi-ethnic populations and disparate fundus camera manufacturers (Canon, Topcon, Zeiss).'
    ],
    methodology: {
      overview: 'RetinaAttnNet integrates a deep ResNet-101 convolutional feature extraction stem with four cross-scale Swin-Transformer attention stages. The network is trained using an ordinal focal loss penalty that severely discourages large ordinal misclassifications (e.g., confusing Proliferative DR with Mild DR).',
      datasetOrMaterials: 'Curated dataset of 145,210 color fundus images from 42,100 unique patients across EyePACS, Messidor-2, APTOS, and two regional Asian hospital networks, graded by a consensus panel of 18 retinal specialists.',
      systemArchitecture: 'Hybrid ResNet-101 stem + 4 Swin-Transformer cross-attention blocks with integrated gradient saliency mapping and dual-task pixel localization heads.',
      evaluationMetrics: 'Quadratic weighted Cohen\'s kappa (κ), area under the ROC curve (AUC), sensitivity, specificity, and mean intersection-over-union (mIoU) for lesion bounding.',
      workflowSteps: [
        { stepNumber: 1, title: 'Fundus Image Normalization', description: 'Color constancy pre-processing, resolution scaling to 512x512, and circular fundus field cropping.' },
        { stepNumber: 2, title: 'Hierarchical Feature Extraction', description: 'ResNet-101 stem extracts low-level textural and microvascular representations.' },
        { stepNumber: 3, title: 'Spatial-Channel Cross Attention', description: 'Swin-Transformer blocks attend to localized microaneurysms, cotton wool spots, and neovascularization.' },
        { stepNumber: 4, title: 'Ordinal Classification & Gradient Localization', description: 'Focal ordinal loss produces calibrated probabilities across 5 stages and generates explainable saliency heatmaps.' }
      ]
    },
    keyFindings: [
      { headline: 'Human-Level Diagnostic Concordance (κ = 0.894)', detail: 'RetinaAttnNet attained a quadratic weighted kappa of 0.894 across multi-center test sets, outperforming standard DenseNet-121 (0.832) and ViT-B/16 (0.849).' },
      { headline: 'Near-Zero Miss Rate on Surgical Proliferative DR (98.1% Sensitivity)', detail: 'On Proliferative DR cases requiring urgent laser photocoagulation, the network achieved 98.1% sensitivity at 97.4% specificity, preventing critical false-negative triage.' },
      { headline: 'Explainable Lesion Localization (mIoU = 0.724)', detail: 'Integrated gradients localized 92.4% of ophthalmologist-verified microaneurysms and 88.7% of neovascularization fronds without needing test-time pixel masks.' },
      { headline: 'Robustness to Optical Blur & Cataract Opacity', detail: 'Under simulated 30% contrast degradation and media opacity, accuracy declined by only 4.2%, compared to 17.8% degradation in standard convolutional baselines.' }
    ],
    limitations: [
      { category: 'Edge Hardware Footprint', description: 'RetinaAttnNet contains 86 million parameters, necessitating dedicated edge GPU or NPU accelerators for remote battery-powered clinic deployment.' },
      { category: 'Field of View Constraints', description: 'Trained exclusively on 45° and 50° macula-centered photographs; peripheral lesions captured in ultrawide-field (UWF) optomap devices were not evaluated.' },
      { category: 'Lack of Volumetric Depth', description: '2D color photography cannot quantify intraretinal fluid pockets or macular thickness, which requires optical coherence tomography (OCT).' }
    ],
    futureResearchScope: [
      { area: 'Multimodal OCT & Fundus Fusion', recommendation: 'Combine 2D color fundus photos with 3D volumetric OCT B-scans to detect subclinical diabetic macular edema earlier.' },
      { area: 'Prospective Community Clinic Trials', recommendation: 'Deploy the system in 30 rural health centers in India and Kenya to assess real-world patient referral adherence and workflow impact.' },
      { area: 'Bayesian Disease Trajectory Modeling', recommendation: 'Incorporate patient glycemic biomarkers (HbA1c levels, duration of diabetes) into a Bayesian recurrent model to forecast 2-year vision loss trajectories.' }
    ],
    glossary: [
      { term: 'Quadratic Weighted Kappa (κ)', definition: 'A statistical metric measuring agreement between two raters that heavily penalizes disagreements across distant categories (e.g., misjudging stage 4 as stage 0).' },
      { term: 'Focal Ordinal Loss', definition: 'A specialized neural network loss function designed for ordered categories (Mild < Moderate < Severe) that dynamically scales penalties based on distance from the true stage.' },
      { term: 'Microaneurysms', definition: 'Small saccular outpouchings in the retinal capillary wall; the earliest clinically visible sign of diabetic retinopathy.' },
      { term: 'Neovascularization', definition: 'The abnormal growth of fragile new blood vessels on the retinal surface in Proliferative DR, which can rupture and cause vitreous hemorrhage.' }
    ],
    studyQuiz: [
      {
        question: 'Why did the authors formulate diabetic retinopathy detection as an ordinal multi-class problem instead of binary classification?',
        options: [
          'Binary classification cannot differentiate between urgent surgical stages (Proliferative) and manageable non-proliferative stages.',
          'Binary classification requires twice as many GPU hours to train.',
          'Binary classification does not support color fundus photographs.',
          'Medical regulatory agencies forbid binary machine learning models.'
        ],
        correctOptionIndex: 0,
        explanation: 'Binary triage merely separates normal from referable, which cannot distinguish high-risk proliferative disease requiring urgent laser therapy from early mild cases.'
      },
      {
        question: 'What quadratic weighted Cohen\'s kappa (κ) did RetinaAttnNet achieve on independent test cohorts?',
        options: ['0.724', '0.832', '0.894', '0.991'],
        correctOptionIndex: 2,
        explanation: 'RetinaAttnNet achieved a quadratic weighted kappa of 0.894, outperforming DenseNet-121 (0.832) and board-certified specialists.'
      },
      {
        question: 'What was identified as a primary limitation of 2D fundus photography in this study?',
        options: [
          'Fundus photography is too expensive for clinical research.',
          'Color 2D photography cannot measure retinal thickness or intraretinal fluid pockets without volumetric OCT scans.',
          'The images could only be processed using monochrome cameras.',
          'It cannot detect red-colored hemorrhages.'
        ],
        correctOptionIndex: 1,
        explanation: '2D fundus photos lack cross-sectional depth, preventing direct measurement of retinal edema fluid pockets.'
      }
    ]
  },
  'sample-renewable-energy': {
    title: 'Interfacial Charge-Transfer Dynamics and Halide Stabilization in High-Efficiency Perovskite-Silicon Tandem Photovoltaics',
    authors: 'Prof. Julian Weber, Dr. Maya Al-Hassan, Carlos Mendez, Hiroshi Tanaka, Sophia Lindqvist (Fraunhofer ISE)',
    field: 'Renewable Energy & Materials Science',
    year: '2024',
    summary: 'This paper demonstrates an engineered monolithic two-terminal (2T) perovskite-silicon tandem solar cell utilizing a fluorinated carbazole self-assembled monolayer (F-2PACz) and a trifluoroethylammonium iodide (TFEAI) molecular surface passivator. The tandem achieves a certified 31.42% power conversion efficiency (PCE) under standard AM1.5G illumination while suppressing non-radiative recombination and photo-induced halide segregation (Hoke effect), retaining 96.4% of initial efficiency after 1,500 hours of continuous operational testing.',
    researchProblem: 'Single-junction silicon solar cells are bounded by the theoretical Shockley-Queisser efficiency ceiling (~29.4%). While perovskite-silicon tandems offer a viable path beyond 30%, mixed-halide perovskite absorbers suffer from severe interfacial recombination losses and catastrophic photo-induced halide phase segregation under real-world heat and light soaking.',
    researchObjectives: [
      'Synthesize and characterize a fluorinated phosphonic acid self-assembled monolayer (F-2PACz) to optimize band alignment at the hole-selective contact.',
      'Inhibit photo-induced iodide/bromide phase segregation (Hoke effect) via surface capping with hydrophobic fluorinated cations.',
      'Fabricate fully textured monolithic industrial-scale tandem cells exceeding 31% certified power conversion efficiency with verified long-term operational stability.'
    ],
    methodology: {
      overview: 'Monolithic 2T tandem structure with a wide-bandgap (1.68 eV) Cs0.05FA0.85MA0.10Pb(I0.80Br0.20)3 top cell deposited on an industrially textured n-type silicon heterojunction (SHJ) bottom cell.',
      datasetOrMaterials: 'Perovskite top absorbers passivated with F-2PACz hole-transport monolayers and TFEAI capping layers, textured silicon wafers with IZO recombination layers and atomic layer deposited SnO2 buffer layers.',
      systemArchitecture: 'Glass / ITO / F-2PACz / Mixed-halide Perovskite / TFEAI / C60 / ALD-SnO2 / IZO / Textured SHJ Silicon Cell / Rear Ag grid.',
      evaluationMetrics: 'Power conversion efficiency (PCE), open-circuit voltage (Voc), fill factor (FF), time-resolved photoluminescence (TRPL), GIWAXS phase mapping, and ISOS-L-2 continuous MPPT testing.',
      workflowSteps: [
        { stepNumber: 1, title: 'Hole Contact Functionalization', description: 'Conformal self-assembly of fluorinated F-2PACz monolayers atop textured bottom cell transparent conductive oxide.' },
        { stepNumber: 2, title: 'Perovskite Deposition & Annealing', description: 'Two-step slot-die coating of wide-bandgap mixed-cation halide precursor films.' },
        { stepNumber: 3, title: 'Fluorinated Surface Passivation', description: 'Application of TFEAI molecular capping layer to neutralize dangling halide and lead vacancies.' },
        { stepNumber: 4, title: 'Encapsulation & Accelerated Photothermal Testing', description: 'Hermetic butyl edge glass packaging followed by 1,500-hour continuous 1-sun MPPT tracking at 65°C.' }
      ]
    },
    keyFindings: [
      { headline: 'Certified 31.42% Power Conversion Efficiency', detail: 'The monolithic tandem achieved certified 31.42% efficiency (Voc = 1.954 V, FF = 82.1%), establishing a new benchmark for textured architectures.' },
      { headline: '7.6x Increase in Carrier Lifetime (3,210 ns)', detail: 'Time-resolved photoluminescence revealed that carrier lifetime increased from 420 ns in control films to 3,210 ns with dual F-2PACz/TFEAI passivation.' },
      { headline: 'Elimination of the Hoke Effect at 65°C', detail: 'In-situ GIWAXS and optical spectroscopy confirmed zero iodide-bromide phase segregation after 500 hours of continuous light soaking.' },
      { headline: 'ISOS-L-2 Operational Longevity (1,500 hrs)', detail: 'Encapsulated tandem cells maintained 96.4% of initial power output after 1,500 hours of continuous maximum power point tracking.' }
    ],
    limitations: [
      { category: 'Area Upscaling Resistance Losses', detail: 'Laboratory achievements were obtained on 1.04 cm² cells; scaling to full commercial M10/G12 wafers (240+ cm²) causes series resistance losses in transparent contacts.' },
      { category: 'Lead (Pb) Eco-toxicity', detail: 'Presence of water-soluble lead halides requires strict containment compliance under international hazardous substance directives.' },
      { category: 'Vacuum Equipment CapEx', detail: 'Thermal evaporation of C60 and atomic layer deposition of SnO2 require expensive high-vacuum fabrication tooling compared to roll-to-roll printing.' }
    ],
    futureResearchScope: [
      { area: 'Lead-Free & Low-Lead Double Perovskites', recommendation: 'Explore bismuth-tin or germanium halide compounds to eliminate toxic lead while maintaining optimal optical bandgaps.' },
      { area: 'High-Throughput Ambient Slot-Die Coating', recommendation: 'Adapt vacuum-free chemical deposition protocols for roll-to-roll pilot manufacturing on flexible substrates.' },
      { area: 'Bifacial Outdoor Field Yield Studies', recommendation: 'Implement rear-side transparent conductive grids to capture ground albedo reflections for an additional 10–20% energy yield in desert installations.' }
    ],
    glossary: [
      { term: 'Shockley-Queisser Limit', definition: 'The theoretical maximum efficiency limit of a single p-n junction solar cell (~29.4% for silicon) under unaugmented sunlight.' },
      { term: 'Hoke Effect', definition: 'A phenomenon in mixed-halide perovskites where continuous illumination causes iodide and bromide ions to segregate into separate low-bandgap phase domains, causing carrier trapping.' },
      { term: 'Quasi-Fermi Level Splitting (QFLS)', definition: 'The energy difference between the electron and hole quasi-Fermi levels inside an illuminated semiconductor, which dictates the maximum achievable open-circuit voltage.' },
      { term: 'Self-Assembled Monolayer (SAM)', definition: 'A single layer of organic molecules that spontaneously orient themselves on a substrate surface to fine-tune interfacial energy level alignment.' }
    ],
    studyQuiz: [
      {
        question: 'What is the primary advantage of a tandem solar cell compared to a traditional single-junction silicon cell?',
        options: [
          'It splits the solar spectrum, allowing the top cell to absorb high-energy blue photons and the silicon cell to capture infrared photons.',
          'It operates without requiring electrical contacts.',
          'It eliminates the need for solar inverters.',
          'It produces alternating current directly from sunlight.'
        ],
        correctOptionIndex: 0,
        explanation: 'Tandem cells overcome single-junction thermalization losses by absorbing distinct spectral bands with matched bandgap materials.'
      },
      {
        question: 'What certified power conversion efficiency did the engineered tandem cell achieve in this study?',
        options: ['24.8%', '29.4%', '31.42%', '45.1%'],
        correctOptionIndex: 2,
        explanation: 'The monolithic perovskite-silicon tandem achieved a certified 31.42% efficiency under AM1.5G illumination.'
      },
      {
        question: 'How did the authors eliminate photo-induced phase segregation (the Hoke effect)?',
        options: [
          'By cooling the solar cell with liquid nitrogen during operation.',
          'By utilizing fluorinated surface passivators (TFEAI) and F-2PACz monolayers that arrest halide ion migration.',
          'By removing all iodine from the perovskite formulation.',
          'By operating only under infrared wavelengths.'
        ],
        correctOptionIndex: 1,
        explanation: 'Hydrophobic fluorinated surface capping passivates dangling bonds and arrests halide ion mobility under thermal and light stress.'
      }
    ]
  },
  'sample-transformer-nlp': {
    title: 'Attention Is All You Need: Scalable Multi-Head Attention for Sequence-to-Sequence Modeling',
    authors: 'Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit et al. (Google Brain & Google Research)',
    field: 'Computer Science & Natural Language Processing',
    year: '2017',
    summary: 'Vaswani et al. introduce the Transformer, an architectural framework that dispenses entirely with recurrence and convolutions in favor of self-attention mechanisms. Evaluated on WMT 2014 English-to-German and English-to-French translation, the Transformer achieves state-of-the-art BLEU scores (28.4 and 41.8) while training orders of magnitude faster due to full sequence-level GPU parallelization.',
    researchProblem: 'Dominant sequence-to-sequence models (LSTM, GRU, RNN) process tokens sequentially, creating an inherent sequential computational bottleneck that prohibits parallel training within examples. Moreover, propagating signals across long distances requires O(N) operations, making it difficult to capture long-range linguistic dependencies without vanishing gradients.',
    researchObjectives: [
      'Eliminate sequential recurrent and convolutional inductive biases from sequence transduction models.',
      'Formulate Scaled Dot-Product and Multi-Head Attention capable of calculating arbitrary token relationships in constant O(1) sequential steps.',
      'Substantially decrease training time while setting new state-of-the-art BLEU benchmarks on English-to-German and English-to-French translation.'
    ],
    methodology: {
      overview: 'Stacked encoder-decoder architecture built exclusively with multi-head self-attention, position-wise feed-forward networks, and sinusoidal positional encodings to inject token ordering.',
      datasetOrMaterials: 'WMT 2014 English-to-German dataset (4.5 million sentence pairs) and English-to-French dataset (36 million sentence pairs), tokenized via Byte-Pair Encoding (BPE).',
      systemArchitecture: '6 encoder layers and 6 decoder layers with 8 parallel attention heads, model dimension d_model = 512, inner feed-forward dimension d_ff = 2048, residual connections, and layer normalization.',
      evaluationMetrics: 'Bilingual Evaluation Understudy (BLEU) score, floating point operations (FLOPs), and training wall-clock time.',
      workflowSteps: [
        { stepNumber: 1, title: 'Byte-Pair Encoding & Positional Injection', description: 'Vocabulary subword segmentation combined with sinusoidal position coordinates.' },
        { stepNumber: 2, title: 'Multi-Head Attention Projections', description: 'Linear projections of queries, keys, and values across 8 distinct subspaces.' },
        { stepNumber: 3, title: 'Scaled Dot-Product Attention', description: 'Softmax((Q * K^T) / sqrt(d_k)) * V computation allowing tokens to attend across the entire sequence simultaneously.' },
        { stepNumber: 4, title: 'Feed-Forward Transformation & LayerNorm', description: 'Pointwise non-linear expansions, residual additions, and autoregressive decoding.' }
      ]
    },
    keyFindings: [
      { headline: 'State-of-the-Art BLEU (28.4 En-De, 41.8 En-Fr)', detail: 'The Transformer outperformed all previously published ensemble models by over 2.0 BLEU on English-to-German and set a new record on English-to-French.' },
      { headline: 'Drastic Training Speedup (12 hrs vs. Weeks)', detail: 'The base model required only 12 hours of training on 8 P100 GPUs, reducing computational costs by an order of magnitude compared to recurrent GNMT.' },
      { headline: 'Constant O(1) Path Length for Long-Distance Dependencies', detail: 'Direct attention paths between arbitrary tokens eliminate gradient degradation over long document contexts.' },
      { headline: 'Generalization to English Constituency Parsing (92.7 F1)', detail: 'Without task-specific architecture tuning, the 4-layer model set strong parsing benchmarks on the Wall Street Journal corpus.' }
    ],
    limitations: [
      { category: 'Quadratic Computational Complexity', description: 'Standard self-attention scales quadratically (O(N²)) in memory and computation with sequence length N, constraining processing of long books or codebases.' },
      { category: 'Absence of Inductive Locality Biases', description: 'Unlike CNNs (which naturally assume adjacent pixels are correlated), Transformers require massive training corpora to learn basic spatial and temporal locality.' },
      { category: 'Autoregressive Inference Latency', description: 'While training is parallelized, generating tokens at test time requires sequential step-by-step decoding.' }
    ],
    futureResearchScope: [
      { area: 'Sub-Quadratic & Linear Attention Architectures', recommendation: 'Develop kernelized or sparse attention matrices (such as Linformer, Performer, FlashAttention) to handle sequences with millions of tokens.' },
      { area: 'Self-Supervised Pre-Training at Massive Scale', recommendation: 'Pre-train deep bidirectional or generative transformers on unlabeled Internet corpora (foreshadowing BERT and GPT models).' },
      { area: 'Multimodal Vision-Language Expansion', recommendation: 'Replace convolutional backbones in computer vision and audio speech recognition with patch-based Vision Transformers (ViT).' }
    ],
    glossary: [
      { term: 'Scaled Dot-Product Attention', definition: 'An attention formula that computes dot products between query and key vectors, scales by 1/sqrt(d_k) to prevent vanishing gradients, and applies softmax weights to value vectors.' },
      { term: 'Multi-Head Attention', definition: 'Running the attention mechanism multiple times in parallel with different linear projections, enabling the model to jointly attend to syntax, semantics, and coreference.' },
      { term: 'BLEU Score', definition: 'A metric for evaluating machine translation by calculating n-gram precision overlap between machine output and human reference translations.' },
      { term: 'Byte-Pair Encoding (BPE)', definition: 'A data compression and subword tokenization algorithm that iteratively merges frequent character pairs to handle rare and out-of-vocabulary words.' }
    ],
    studyQuiz: [
      {
        question: 'What is the main computational disadvantage of recurrent neural networks (RNNs) that Transformers overcome?',
        options: [
          'RNNs cannot process English text.',
          'RNNs must compute states sequentially token by token, preventing GPU parallelization during training.',
          'RNNs do not support floating-point operations.',
          'RNNs can only run on mobile phones.'
        ],
        correctOptionIndex: 1,
        explanation: 'RNN recurrence prevents parallelization within training sequences, creating a severe GPU throughput bottleneck.'
      },
      {
        question: 'Why does the attention formula divide the dot product (Q * K^T) by sqrt(d_k)?',
        options: [
          'To make the matrix square.',
          'To prevent dot products from growing excessively large for large dimensions, which would push softmax into regions with vanishing gradients.',
          'To invert the attention matrix.',
          'To encrypt the queries and keys.'
        ],
        correctOptionIndex: 1,
        explanation: 'For large values of d_k, dot products grow large, pushing the softmax function into regions with extremely small gradients. Scaling by 1/sqrt(d_k) stabilizes training.'
      },
      {
        question: 'What is the theoretical complexity of standard self-attention with respect to sequence length N?',
        options: ['O(1)', 'O(log N)', 'O(N)', 'O(N²)'],
        correctOptionIndex: 3,
        explanation: 'Self-attention requires computing pairwise dot products between all N tokens and all other N tokens, resulting in O(N²) time and memory complexity.'
      }
    ]
  }
};
app.get('/api/sample-papers', (_req, res) => {
  res.json({
    success: true,
    papers: SAMPLE_PAPERS.map(p => ({
      id: p.id,
      title: p.title,
      authors: p.authors,
      domain: p.domain,
      year: p.year,
      summarySnippet: p.summarySnippet,
    }))
  });
});

// API: Analyze Paper (supports PDF Base64, Sample Paper ID, or raw text)
app.post('/api/analyze', async (req, res) => {
  try {
    const { pdfBase64, sampleId, rawText, filename } = req.body;

    let extractedText = '';
    let pageCount = 1;
    let paperTitleHint = filename ? filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ') : undefined;

    // 1. Check if loading a sample paper
    if (sampleId) {
      const sample = SAMPLE_PAPERS.find(p => p.id === sampleId);
      if (!sample) {
        return res.status(404).json({ success: false, error: 'Sample paper not found' });
      }
      extractedText = sample.fullText;
      paperTitleHint = sample.title;
      pageCount = 6;

      // If we have a verified pre-computed structured analysis for this sample, return it directly
      if (SAMPLE_ANALYSES[sampleId]) {
        const wordCount = extractedText.trim().split(/\s+/).length;
        const readingTimeMinutes = Math.max(1, Math.round(wordCount / 220));

        return res.json({
          success: true,
          analysis: SAMPLE_ANALYSES[sampleId],
          metadata: {
            filename: `${sampleId}.pdf`,
            pageCount,
            wordCount,
            charCount: extractedText.length,
            readingTimeMinutes,
          },
          extractedText: extractedText.slice(0, 60000),
        });
      }
    } else if (pdfBase64) {
      // 2. Validate PDF Base64
      try {
        const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
        const pdfBuffer = Buffer.from(cleanBase64, 'base64');

        // Check PDF magic bytes (%PDF)
        if (pdfBuffer.length < 4 || pdfBuffer.toString('utf8', 0, 4) !== '%PDF') {
          return res.status(400).json({
            success: false,
            error: 'The uploaded file does not appear to be a valid PDF document. Please upload a standard PDF research paper.'
          });
        }

        // Extract text via pdf-parse
        const parsedPdf = await pdfParse(pdfBuffer, {
          max: 50 // cap at 50 pages for speed and token boundaries
        });

        extractedText = parsedPdf.text || '';
        pageCount = parsedPdf.numpages || 1;

        if (parsedPdf.info?.Title) {
          paperTitleHint = parsedPdf.info.Title;
        }

        if (!extractedText || extractedText.trim().length < 50) {
          return res.status(422).json({
            success: false,
            error: 'Could not extract readable text from this PDF. It may be a scanned image document without OCR, or protected by encryption.'
          });
        }
      } catch (pdfErr: any) {
        console.error('PDF parsing error:', pdfErr);
        return res.status(400).json({
          success: false,
          error: `Failed to parse PDF file: ${pdfErr.message || 'Corrupted or unsupported format.'}`
        });
      }
    } else if (rawText) {
      extractedText = rawText;
      pageCount = Math.ceil(extractedText.length / 3000) || 1;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Please upload a PDF file, select a sample paper, or paste research text.'
      });
    }

    // Check Gemini API key availability
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
      return res.status(400).json({
        success: false,
        error: 'Gemini API key is not configured. Please ensure your API key is configured in Settings > Secrets to analyze custom papers. In the meantime, you can test the application using the curated sample papers!'
      });
    }

    // Call Gemini 3.8 Flash with Few-Shot Prompting and JSON responseSchema
    const prompt = buildFewShotPrompt(extractedText, paperTitleHint);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are ResearchMate, an academic research assistant that analyzes research papers using precise few-shot structured methodology. You always output valid, richly detailed JSON according to the schema.',
          responseMimeType: 'application/json',
          responseSchema: analysisResponseSchema as any,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini model returned an empty response.');
      }

      let parsedAnalysis;
      try {
        parsedAnalysis = JSON.parse(responseText);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON response:', responseText);
        throw new Error('Invalid JSON format received from AI model analysis.');
      }

      const wordCount = extractedText.trim().split(/\s+/).length;
      const readingTimeMinutes = Math.max(1, Math.round(wordCount / 220));

      return res.json({
        success: true,
        analysis: parsedAnalysis,
        metadata: {
          filename: filename || (sampleId ? `${sampleId}.pdf` : 'research_paper.pdf'),
          pageCount,
          wordCount,
          charCount: extractedText.length,
          readingTimeMinutes,
        },
        extractedText: extractedText.slice(0, 60000),
      });
    } catch (genErr: any) {
      console.error('Gemini generateContent error:', genErr);
      if (genErr?.status === 403 || genErr?.message?.includes('PERMISSION_DENIED') || genErr?.message?.includes('API_KEY_INVALID')) {
        return res.status(403).json({
          success: false,
          error: 'Gemini API permission denied. Please verify your GEMINI_API_KEY in Settings > Secrets.'
        });
      }
      throw genErr;
    }
  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An unexpected error occurred while analyzing the paper.'
    });
  }
});

// API: Context-Aware Chatbot grounded in the Research Paper
app.post('/api/chat', async (req, res) => {
  try {
    const { paperText, analysisSummary, messages, userQuestion } = req.body;

    if (!userQuestion || !userQuestion.trim()) {
      return res.status(400).json({ success: false, error: 'User question is required.' });
    }

    const paperContextSnippet = (paperText || '').slice(0, 25000);
    const summaryContext = typeof analysisSummary === 'object' ? JSON.stringify(analysisSummary, null, 2).slice(0, 8000) : '';

    // If Gemini API key is available, call Gemini 3.8 Flash
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      try {
        const systemInstruction = `You are ResearchMate AI Chatbot, an expert academic advisor and tutor assisting a student in understanding the uploaded research paper.
Your job is to answer questions strictly grounded in the paper's contents, methodology, findings, and limitations.

CONTEXT ABOUT THE PAPER:
${summaryContext ? `### STRUCTURED PAPER ANALYSIS:\n${summaryContext}\n` : ''}
${paperContextSnippet ? `### PAPER EXCERPTS & TEXT:\n${paperContextSnippet}\n` : ''}

GUIDELINES FOR YOUR ANSWERS:
1. Always ground your claims directly in the paper. If the paper does not mention a specific detail, explicitly state: "The paper does not provide information regarding [topic], but generally in this field..."
2. When answering students, be pedagogical, articulate, and clear. Break down dense academic jargon into intuitive concepts.
3. Reference specific sections, equations, or empirical figures (e.g., "In Section 3 (Methodology)..." or "As reported in Table 2...") where relevant.
4. Keep tone academic yet accessible, encouraging critical thinking.
5. Provide follow-up questions or suggestions at the end to prompt further curiosity.`;

        const contents: any[] = [];
        if (Array.isArray(messages) && messages.length > 0) {
          for (const m of messages.slice(-8)) {
            contents.push({
              role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
              parts: [{ text: m.content || m.text || '' }]
            });
          }
        }

        contents.push({
          role: 'user',
          parts: [{ text: userQuestion }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
          }
        });

        const answer = response.text || 'I could not generate an answer at this time. Please try rephrasing your question.';
        return res.json({ success: true, reply: answer });
      } catch (geminiChatErr: any) {
        console.warn('Gemini chat API error, falling back to contextual heuristic:', geminiChatErr.message);
      }
    }

    // Heuristic contextual fallback if API key is not configured or rate limited
    const qLower = userQuestion.toLowerCase();
    let reply = '';

    if (qLower.includes('method') || qLower.includes('how') || qLower.includes('architecture')) {
      reply = `**Methodological Breakdown:**\n\n${analysisSummary?.methodology?.overview || 'The paper employs a specialized experimental setup.'}\n\n**Data/Materials:** ${analysisSummary?.methodology?.datasetOrMaterials || 'N/A'}\n\n**System Architecture:** ${analysisSummary?.methodology?.systemArchitecture || 'N/A'}\n\n**Evaluation Metrics:** ${analysisSummary?.methodology?.evaluationMetrics || 'N/A'}`;
    } else if (qLower.includes('finding') || qLower.includes('result') || qLower.includes('achieve') || qLower.includes('breakthrough')) {
      const findingsList = (analysisSummary?.keyFindings || [])
        .map((f: any, i: number) => `${i + 1}. **${f.headline}**: ${f.detail}`)
        .join('\n\n');
      reply = `**Key Findings & Results:**\n\n${findingsList || 'No key findings found.'}`;
    } else if (qLower.includes('limit') || qLower.includes('threat') || qLower.includes('weakness') || qLower.includes('bias')) {
      const limList = (analysisSummary?.limitations || [])
        .map((l: any, i: number) => `${i + 1}. **[${l.category}]** ${l.description}`)
        .join('\n\n');
      reply = `**Research Limitations:**\n\n${limList || 'No limitations recorded.'}`;
    } else if (qLower.includes('problem') || qLower.includes('why') || qLower.includes('gap')) {
      reply = `**Research Problem & Literature Gap:**\n\n${analysisSummary?.researchProblem || 'Problem details unavailable.'}`;
    } else if (qLower.includes('objective') || qLower.includes('goal')) {
      const objList = (analysisSummary?.researchObjectives || [])
        .map((o: string, i: number) => `${i + 1}. ${o}`)
        .join('\n');
      reply = `**Research Objectives:**\n\n${objList || 'Objectives unavailable.'}`;
    } else if (qLower.includes('future') || qLower.includes('next')) {
      const futList = (analysisSummary?.futureResearchScope || [])
        .map((f: any, i: number) => `${i + 1}. **${f.area}**: ${f.recommendation}`)
        .join('\n\n');
      reply = `**Future Research Scope:**\n\n${futList || 'Future directions unavailable.'}`;
    } else {
      reply = `Based on the paper **"${analysisSummary?.title || 'the study'}"**:\n\n${analysisSummary?.summary || ''}\n\nWould you like more details on the **methodology**, **empirical findings**, **limitations**, or **glossary concepts**?`;
    }

    res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process chat query.'
    });
  }
});

// Configure Vite middleware in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`ResearchMate server running on port ${PORT}`);
  });
}

startServer();
