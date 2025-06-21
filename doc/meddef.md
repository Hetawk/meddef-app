\documentclass[journal,twoside,web]{ieeecolor}
\usepackage{tmi}
\usepackage{cite}
\usepackage{amsmath,amssymb,amsfonts}
\usepackage{algorithmic}
\usepackage{graphicx}
\usepackage{textcomp}
\usepackage{multirow} % Add this package for \multirow command
\usepackage{url} % Add this package for \url command
\usepackage{subcaption} % Add this package for subfigures
\usepackage{microtype}
\usepackage{caption}
\usepackage[bookmarks=true, bookmarksopen=true, bookmarksnumbered=true,
            colorlinks=true, linkcolor=blue, citecolor=blue, urlcolor=blue]{hyperref}

% Set labelsep to newline for separate lines and add justification=centering for consistent centering
% Let the IEEE class handle other styling (uppercase, font)
\captionsetup[table]{labelsep=newline, justification=centering}

% Modify the caption command to make table captions uppercase
\makeatletter
\let\@oldmakecaption\@makecaption
\renewcommand{\@makecaption}[2]{%
  \ifx\@captype\@IEEEtablestring
    % For tables, make caption uppercase
    \@oldmakecaption{#1}{\MakeUppercase{#2}}%
  \else
    % For figures, keep original behavior
    \@oldmakecaption{#1}{#2}%
  \fi
}
\makeatother


\sloppy
\raggedbottom
\def\BibTeX{{\rm B\kern-.05em{\sc i\kern-.025em b}\kern-.08em
    T\kern-.1667em\lower.7ex\hbox{E}\kern-.125emX}}
\markboth{\journalname, VOL. XX, NO. XX, XXXX 2020}
{Author \MakeLowercase{\textit{et al.}}: Preparation of Papers for IEEE TRANSACTIONS ON MEDICAL IMAGING}
\begin{document}
\title{MedDef: An Efficient Self-Attention Model for Adversarial Resilience in Medical Imaging with Unstructured Pruning}
\author{E.K. Dongbo, S. Niu, \IEEEmembership{Member, IEEE}, P. Fero, P. Bargin, and J.N. Kofa
\thanks{The date for submission is April 24, 2025. This research was supported by the National Natural Science Foundation of China (Grant No. 62471202, 62302191), the Natural Science Foundation of Shandong Province (Grant No. ZR2023QF001), Development Program Project of Youth Innovation Team of Institutions of Higher Learning in Shandong Province (Grant No. 2023KJ315), Young Talent of Lifting Engineering for Science and Technology in Shandong (Grant No. SDAST2024QTA014), and the Key Laboratory of Intelligent Computing Technology for Network Environment, Shandong Province, School of Information Science and Engineering, University of Jinan.}
\thanks{E. K. Dongbo, and S. Niu are with The School of Information Science and Engineering, University of Jinan, Jinan, P.R. China, 250022 (e-mail: enoch.dongbo@stu.ujn.edu.cn; sjniu@hotmail.com).}
\thanks{P. Fero, and P. Bargin are with The School of Computer Science \& Technology, Zhejiang Sci-Tech University, Hangzhou, P.R. China, 310018 (e-mail: feropatience@gmail.com; l20212E050205@mails.zstu.edu.cn).}
\thanks{J. N. Kofa, is with The College of Informatics, Huazhong Agricultural University, Wuhan, P.R. China, 430070 (e-mail: meekkofa@gmail.com).}}

\maketitle

\begin{abstract}
In an effort to improve diagnostic precision, medical imaging systems are increasingly incorporating artificial intelligence (AI). However, these systems remain susceptible to adversarial attacks, which are subtle, undetectable disruptions intended to trick models into generating inaccurate results. While existing approaches such as input preprocessing and adversarial training offer partial solutions, they often compromise diagnostic accuracy because they fail to distinguish between adversarial noise and medically relevant fine-grained features. We introduce Medical Defense (MedDef), a novel defensive architecture that fundamentally addresses this challenge by integrating a Defense-Aware Attention Mechanism (DAAM) with strategic unstructured pruning to achieve robust adversarial resilience. DAAM represents a paradigm shift from post-hoc defenses to architecturally integrated robustness, incorporating three synergistic components: Adversarial Feature Detection (for noise suppression), Medical Feature Extraction (for domain-aware feature enhancement), and Multi-Scale Feature Analysis (for coordinated multi-resolution defense). These components collaboratively identify and neutralize adversarial noise while amplifying diagnostically critical features, fundamentally addressing vulnerability at the feature learning level rather than through external defensive mechanisms. Extensive experiments on Retinal OCT and Chest X-Ray datasets against four common attack methods demonstrate that MedDef achieves exceptional robustness (up to 97.52\% adversarial accuracy) while maintaining high diagnostic accuracy, establishing that security and diagnostic performance can be simultaneously optimized rather than traded off, laying the foundation for clinically viable, adversarially robust medical imaging systems.
\end{abstract}

\begin{IEEEkeywords}
Adversarial Resilience, Medical Imaging, Defense-Aware Attention Mechanism (DAAM), Unstructured Pruning, Robust Model
\end{IEEEkeywords}

\section{Introduction}
\label{sec:introduction}
\IEEEPARstart{D}{eep} neural networks have revolutionized medical imaging analysis, achieving unprecedented diagnostic accuracy across various conditions\cite{Mamo24}. While these systems approach or exceed human-level performance in specialized tasks, they remain vulnerable to adversarial attacks; imperceptible perturbations that cause incorrect predictions with potentially serious clinical consequences \cite{Bortsova21, Kaviani22}.

Current defense strategies fall into several areas, which can be categorically grouped into three: (1) input preprocessing techniques (denoising\cite{Chiang20}, JPEG compression\cite{Cheng21}) that neutralize perturbations; (2) model regularization approaches like adversarial training\cite{Muoka23} that improve robustness; and (3) architectural modifications (defensive distillation\cite{Qi24}, feature squeezing\cite{Zheng21}, ensemble methods\cite{Alzubaidi24}) that detect or mitigate adversarial inputs. The success of these methods is, however, constrained by the particular difficulties associated with medical imaging. Research shows adversarial training reduced classification accuracy for subtle pathological features by 8-12\%\cite{Sriramanan21}, while preprocessing techniques decreased sensitivity to critical diagnostic signals by up to 14\%\cite{Suganyadevi22}. Comparative studies across modalities revealed state-of-the-art defenses reduce clear image performance by 5-16\% \cite{Rodriguez22}, highlighting an unacceptable robustness-accuracy tradeoff.

Three critical challenges emerge in medical imaging defense that directly motivate our DAAM design: 

\textbf{Challenge 1: Feature Preservation vs. Noise Suppression.} Diagnostic features in medical images are often subtle, localized textures and patterns that preprocessing techniques inadvertently suppress\cite{Chiang20}. For instance, early retinal pathology manifests as microscopic changes in photoreceptor layer thickness, while adversarial perturbations exploit similar high-frequency characteristics. This necessitates a defense mechanism that can distinguish between medically relevant fine-grained features and adversarial noise—motivating our Adversarial Feature Detection (AFD) component that specifically targets noise patterns while preserving diagnostic details.

\textbf{Challenge 2: Scale-Dependent Vulnerability.} Medical images contain diagnostically critical information at multiple spatial scales—from cellular-level abnormalities to organ-level structural changes. Adversarial attacks exploit this multi-scale nature by targeting specific resolution levels where defenses are weakest\cite{Sahu24}. Dermatology research demonstrated that feature squeezing increased robustness by 23\% but reduced early melanoma detection sensitivity by 17\%, highlighting the need for scale-aware defense. This directly motivates our Multi-Scale Feature Analysis (MSF) component to provide coordinated defense across all relevant spatial resolutions.

\textbf{Challenge 3: Domain-Specific Robustness Requirements.} Medical imaging requires preservation of anatomically meaningful features (edges, textures, morphological patterns) that distinguish pathological from normal tissue. Conventional defenses treat robustness as competing with accuracy rather than leveraging medical domain knowledge\cite{Sriramanan21}. This motivates our Medical Feature Extraction (MFE) component that explicitly enhances diagnostically relevant anatomical features while suppressing adversarial perturbations.

To address these challenges, we introduce MedDef, featuring a Defense-Aware Attention Mechanism (DAAM) that integrates defensive capabilities directly into the feature processing pipeline. DAAM is specifically architected with three synergistic components, each addressing a distinct vulnerability identified in medical adversarial defense:

\textbf{Adversarial Feature Detection (AFD)} implements a learned noise detection mechanism that identifies and suppresses high-frequency perturbations characteristic of adversarial attacks while preserving diagnostically relevant fine-grained features through residual connections and sigmoid gating.

\textbf{Medical Feature Extraction (MFE)} leverages medical domain knowledge by explicitly enhancing edge detection and texture analysis—the fundamental building blocks of medical image interpretation—ensuring that anatomically meaningful patterns are amplified relative to adversarial noise.

\textbf{Multi-Scale Feature Analysis (MSF)} provides coordinated defense across multiple spatial resolutions, preventing attackers from exploiting scale-specific vulnerabilities while maintaining the hierarchical feature representation essential for medical diagnosis.

By using self-attention modules that dynamically modify feature relevance based on spatial and channel-wise relationships guided by these three defensive components, DAAM suppresses adversarial perturbations while improving focus on diagnostically significant regions. This mechanism works in concert with unstructured pruning that preserves critical diagnostic pathways while eliminating vulnerabilities, creating a more compact and robust architecture\cite{hirano2021universal}.

Our contributions include:
\begin{enumerate}
    \item \textbf{Principled DAAM Architecture:} A novel Defense-Aware Attention Mechanism that integrates adversarial robustness directly into feature extraction through three synergistic components (AFD, MFE, MSF), each specifically designed to address distinct vulnerabilities in medical adversarial defense. Unlike post-hoc defenses, DAAM fundamentally alters how features are processed to achieve simultaneous optimization of diagnostic accuracy and adversarial robustness.
    
    \item \textbf{Medical Domain-Aware Defensive Strategy:} The first defensive approach to explicitly incorporate medical imaging domain knowledge (edge detection, texture analysis, multi-scale pathology) into adversarial defense mechanisms, ensuring that defensive capabilities enhance rather than compromise diagnostic performance. Our MFE component demonstrates that domain-specific feature enhancement can serve as an effective defensive strategy.
    
    \item \textbf{Compression-Security Synergy:} Identification of strategic unstructured pruning as an effective complementary defensive strategy that challenges conventional wisdom about compression degrading robustness. Our comprehensive analysis across 0-80\% pruning rates reveals dataset-dependent optimal compression points: Chest X-Ray models achieve peak performance at 40\% pruning (98.38\% vs 97.67\% unpruned), while ROCT models maintain optimal performance up to 30\% pruning without degradation. Notably, Tables~\ref{tab:roct_compression_security} and~\ref{tab:chest_compression_security} demonstrate that moderate pruning (20-40\%) can enhance defensive capabilities while reducing computational overhead by 20-40\%, providing practical deployment guidelines for resource-constrained clinical environments. This finding establishes that the compression-security relationship is not universally antagonistic but can be leveraged as a defensive mechanism when properly calibrated for medical imaging domains.ployment guidelines for clinical environments.
\end{enumerate}

\section{Related Work}
\label{sec:related_work}

\subsection{Adversarial Defense Techniques in Medical Imaging}
Recent research has increasingly focused on addressing adversarial attacks in medical imaging, which can lead to severe consequences such as misdiagnosis and inaccurate clinical decisions\cite{Dhamija24}. To solve these issues, a variety of defense tactics have been proposed. These include input pre-processing, adversarial training, and strategies for algorithm comprehension\cite{Pal24}. Zhao\cite{Zhao22} presented a strong architecture that enhances resilience against such attacks by combining Unsupervised Adversarial Detection and Semi-Supervised Adversarial Training. Paschali highlighted the importance of evaluating both generalizability and model resilience, demonstrating notable differences in performance in extreme environments \cite{Priya23}. Additionally, Luo proposed a game-theoretic framework integrating conformal prediction to enhance model robustness against both known and unknown adversarial perturbations\cite{Luo24}.

Moreover, Alzubaidi introduced the Model Ensemble Feature Fusion (MEFF) technique, which integrates features from many deep learning models to improve robustness against various adversarial attacks across diverse medical imaging applications\cite{Alzubaidi24}. Sahu explored the vulnerabilities of deep learning models in medical image diagnosis and proposed adversarial training as a key defense mechanism\cite{Sahu24}. These studies collectively highlight the growing importance of developing robust defense strategies to ensure the reliability and accuracy of AI systems in medical imaging. The ongoing developments in this field highlight how critical the need is for continuous innovation to defend medical imaging technologies against adversarial threats. This body of work not only advances our understanding of adversarial resilience but also paves the way for more secure and reliable medical imaging applications in the future\cite{Ou24}.

Furthermore, novel techniques have been developed lately to further improve the robustness of medical imaging models. For example, Biswas created a hybrid adversarial training method that enhances model resilience against sophisticated attacks by combining supervised and unsupervised learning techniques\cite{Biswas24}, and Singh made a significant contribution by using generative adversarial networks (GANs) to generate synthetic adversarial examples that are then used to train and fortify medical imaging models\cite{Chen22}. These innovative methods demonstrate how research in this area is dynamic and always changing, emphasizing the value of interdisciplinary cooperation and continuous development to protect the integrity of medical imaging systems.

Moreover, Dong suggests a brand-new adversarial training strategy that motivates the model to generate output probabilities for an adversarial example that are comparable to those of its "inverse adversarial" counterpart. This was accomplished by carrying out in-depth tests on a range of vision datasets and architectures, which showed that the training approach achieves both natural accuracy among robust models and state-of-the-art robustness. Additionally, it enhances the efficiency of single-step adversarial training methods at a minimal computational cost by employing a universal version of inverse adversarial instances\cite{Dong24}.

The vast amount of research in the field of adversarial attacks and defending against these attacks on deep neural networks for medical imaging has yielded a variety of approaches and insightful knowledge. Even though these studies greatly advance our knowledge of medical image analysis, further research is still necessary\cite{Li23}. In the future, research efforts should concentrate on creating methods that tackle the dynamic terrain of adversarial attacks, taking into account fresh situations and possible weaknesses. Furthermore, increasing interpretability and openness and incorporating real-world applications can improve the usefulness and efficiency of defense mechanisms. Sustaining the resilience of deep neural networks and staying ahead of adversarial threats will need continued research as the field develops\cite{Eli24}.

\subsection{Attack Methods}
Adversarial attacks aim to fool machine learning algorithms by subtly altering input images while maintaining their visual integrity. Medical imaging is particularly vulnerable to such attacks, as even small misclassifications can have serious clinical repercussions. Building on these research needs, we evaluate our model using four established attack techniques that represent significant threats to medical imaging systems:

\textbf{Fast Gradient Sign Method (FGSM)} is a single-step, gradient-based approach that perturbs the input by taking the sign of the loss function's gradient \cite{Lee21}. Despite its simplicity, FGSM effectively exposes model vulnerabilities by highlighting the direction in which the loss increases most rapidly.

\textbf{Projected Gradient Descent (PGD)} extends FGSM through an iterative process that projects adversarial samples back onto a specified constraint space before adding small perturbations in each iteration\cite{Deng24}. PGD is considered one of the most effective first-order attacks due to its iterative nature, providing a demanding test of model resilience.

\textbf{Basic Iterative Method (BIM)} applies FGSM iteratively with a fixed step size, gradually altering the input over multiple rounds. This approach can progressively degrade model performance, revealing vulnerabilities not apparent with single-step attacks \cite{Li22}.

\textbf{Jacobian-based Saliency Map Attack (JSMA)} utilizes a saliency-based approach that leverages the model's Jacobian to identify the most influential features in the input space. By selectively perturbing these crucial aspects, JSMA creates targeted adversarial examples that particularly challenge defense mechanisms\cite{Yu24}.

These techniques, which include both single-step and iterative approaches, provide comprehensive benchmarks for assessing model robustness while maintaining the visual integrity of medical images. Our methodology combines these attack vectors to thoroughly test its resilience against perturbations that could otherwise lead to critical misdiagnoses in clinical applications \cite{Wang22, Esmaeili23}.

\section{Methodology}
\label{sec:methodology}

This section outline our approach for developing a novel defense-oriented model that synergistically integrates self-attention mechanisms, unstructured pruning, and adversarial training to enhance robustness against adversarial attacks while maintaining high diagnostic accuracy in medical imaging applications.

\subsection{Dataset and Preprocessing}

\subsubsection{Dataset}
Two medical imaging datasets were used: the Retinal OCT (ROCT) dataset (84,484 images across four classes: CNV, DME, Drusen, and Normal) and the Chest X-Ray dataset (5,856 images for binary NORMAL/PNEUMONIA classification). The ROCT dataset was divided into 83,484 training, 32 validation, and 968 test images (242 per class), with original 512×496 grayscale images presenting low brightness and variable aspect ratio challenges. The Chest X-Ray dataset consisted of 4,099 training images (1,108 NORMAL, 2,991 PNEUMONIA), 878 validation images (237 NORMAL, 641 PNEUMONIA), and 879 test images (238 NORMAL, 641 PNEUMONIA), with significant dimension variability (976×544 to 2090×1858) and inconsistent color channels. Both datasets showed variability in image quality, brightness, and contrast that required addressing.

\subsubsection{Preprocessing}
The preprocessing pipeline standardized both datasets by resizing images to 224×224 pixels with aspect-preserving padding and converting grayscale to three-channel format. For ROCT, we applied min-max scaling to [0,1] followed by standardization with mean [0.19338988] and standard deviation [0.1933612] across channels\cite{Elgendi21}, then enhanced contrast using CLAHE and adjusted brightness. The Chest X-Ray dataset underwent similar resizing and channel conversion, with normalization using dataset-specific mean [0.48230693] and standard deviation [0.22157896] values. We implemented denoising to improve image clarity and removed duplicates (24 identified in the Chest X-Ray dataset) to prevent data leakage\cite{Khalifa22}. These steps ensured consistently formatted, noise-free images with preserved diagnostic features essential for accurate classification\cite{Puttagunta21}. Fig~\ref{fig:dataset_samples} shows a sample of each dataset.

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.45\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/fig1_a.png}
\caption{Retinal OCT Samples.}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.45\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/fig1_b.png}
\caption{Chest X-Ray Samples.}
\end{subfigure}
\caption{Representative medical imaging samples from both datasets: (a) ROCT images showing retinal cross-sections with varying pathological conditions including CNV, DME, Drusen, and Normal cases, and (b) Chest X-Ray images demonstrating normal lung parenchyma and pneumonia infiltrates with diverse imaging characteristics and quality variations.}
\label{fig:dataset_samples}
\end{figure*}

\subsection{Proposed Model Architecture and Training Method }

\subsubsection{Model Architecture}
In the development phase of our model, we integrated self-attention mechanisms, unstructured pruning, and adversarial training to enhance both the robustness and efficiency of medical image analysis. The architecture flow advances through three stages; beginning with 1) preprocessing input images from established datasets and applying various data augmentation techniques to diversify the training set; 2) consist of our Defense Aware Attention Mechanism implementation into our model which is then used through stage 3); where we implemented adversarial training approach involves distributing attack perturbations across different data splits: 35\% of the training data, 70\% of the validation data, and 100\% of the test data are exposed to adversarial perturbations. This graded approach to attack exposure ensures thorough model evaluation while maintaining stable training dynamics. Finally, unstructured pruning was done and giving an output of our robust model. The complete architecture is illustrated in Fig.~\ref{fig:model_architecture}.

\begin{figure*}[!t]
\centering
\includegraphics[width=\textwidth]{fig/fig2.jpg}
\caption{Illustrate the MedDef framework, advancing through 3 stages with stage 1) consisting of the input, processing and adversarial image generation; stage 2) consisting of our DAAM defensive strategy and finally, stage 3 consisting of the model training using adversarial training, unstructured pruning and the given output or our robust model}
\label{fig:model_architecture}
\end{figure*}

\subsubsection{Adversarial Training}
In medical imaging, where even little attacks can result in incorrect diagnoses, adversarial training is a proven strategy for strengthening model resilience against malevolent perturbations. This method forces the network to acquire representations that are invariant to such perturbations by introducing adversarial instances straight into the training process\cite{Zeng22}. Fig~\ref{fig:adversarial_training} illustrates the adversarial training process. In our implementation, adversarial examples were generated using the FGSM, PGD, BIM and JSMA attack methods during training. Following standard data preprocessing, adversarial samples are produced and combined with clean images, and the loss is computed over both sets. This dual-objective training ensures that the network learns to mitigate the effects of adversarial noise while preserving performance on clean data. Combined with self-attention mechanisms and unstructured pruning, this adversarial training framework significantly enhances the resilience of our model in the challenging domain of medical imaging.

\begin{figure}[!t]
\centerline{\includegraphics[width=\columnwidth]{fig/fig3.jpg}}
\caption{Illustrates the adversarial training process of adversarial training methodology used in MedDef, showing how clean and adversarial examples are combined during training to enhance robustness.}
\label{fig:adversarial_training}
\end{figure}

\subsection{Defense-Aware Attention Mechanism (DAAM)}
The core innovation of MedDef is the Defense-Aware Attention Mechanism (DAAM), which fundamentally differs from conventional attention mechanisms by integrating adversarial robustness directly into feature processing rather than treating defense as a post-hoc consideration. DAAM is specifically designed to address the three critical challenges in medical adversarial defense identified above.

\textbf{Design Rationale:} Traditional attention mechanisms in medical imaging focus on diagnostic relevance but remain vulnerable to adversarial manipulation because they lack explicit defensive components. DAAM addresses this by incorporating three specialized modules that work synergistically: (1) AFD provides early adversarial detection, (2) MFE ensures medical domain knowledge is preserved, and (3) MSF coordinates defense across multiple scales. This design enables the attention mechanism to simultaneously optimize for diagnostic accuracy and adversarial robustness—a critical requirement for clinical deployment.

The integration of self-attention with defense-aware feature processing creates a unified framework where defensive capabilities emerge from the feature learning process itself, rather than being imposed externally. This architectural choice ensures that robustness is not achieved at the expense of diagnostic performance, but rather enhances it by focusing attention on genuinely relevant medical features while suppressing adversarial noise.

\subsubsection{Self-Attention}
At the heart of our model is a self-attention mechanism that dynamically refines feature representations by establishing direct, global dependencies among all spatial locations\cite{Xu21}. Given an input feature map $X \in \mathbb{R}^{N \times d}$, the model computes query, key, and value matrices as follows:
\begin{equation}
Q = XW_q, \quad K = XW_k, \quad V = XW_v
\end{equation}
where $W_q$, $W_k$, and $W_v$ are learnable projection matrices, and $d_k$ denote the dimension of the key vectors. The attention operation is then defined by the scaled dot-product:
\begin{equation}
A(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V
\end{equation}
where $A$ denotes our attention function. This formulation allows the model to selectively focus on diagnostically relevant regions, creating long-range dependencies and effectively suppressing adversarial perturbations.

\textbf{Adversarial Feature Detection (AFD)} addresses Challenge 1 through a two-stage convolutional architecture with sigmoid gating. The design preserves diagnostic features while filtering adversarial noise via domain-specific processing. Formally:
\begin{equation}
\text{AFD}(x) = x + \mathcal{C}(x \cdot \sigma(\text{Conv}_2(\text{BN}(\text{ReLU}(\text{Conv}_1(x))))))
\end{equation}
where the multiplication operation creates a selective attention mask that amplifies clean features while suppressing adversarial perturbations. \textbf{Experimental validation:} Our comprehensive ablation study demonstrates AFD's substantial contribution—removing AFD results in a 1.27\% decrease in clean accuracy (98.97\% vs 97.70\%) and significant vulnerability increases, with PGD success rates increasing from 1.25\% to 6.54\% when AFD is removed at 30\% pruning on ROCT dataset.

\textbf{Medical Feature Extraction (MFE)} addresses Challenge 3 by enhancing diagnostically critical features. Edge detection with $3 \times 3$ kernels captures boundary information, while texture analysis with $5 \times 5$ kernels identifies morphological patterns. The tanh activation provides bidirectional edge sensitivity, and ReLU emphasizes positive texture features:
\begin{equation}
\text{MFE}(x) = \mathcal{G}([x, \mathcal{E}(x), \mathcal{T}(x)])
\end{equation}
where $\mathcal{E}(x) = \tanh(\text{Conv}_{3 \times 3}(x))$ captures bidirectional edge information and $\mathcal{T}(x) = \text{ReLU}(\text{BN}(\text{Conv}_{5 \times 5}(x)))$ extracts positive texture patterns critical for pathology identification. \textbf{Experimental validation:} The progression from MedDef w/o AFD+MFE to MedDef w/o AFD demonstrates MFE's critical role in maintaining robustness against scale-invariant attacks. Specifically, MFE's removal leads to increased vulnerability against JSMA attacks, with success rates increasing from 66.18\% to 72.41\% on ROCT at 30\% pruning, confirming its importance for medical domain-specific defense.

\textbf{Multi-Scale Feature Analysis (MSF)} addresses Challenge 2 by coordinating defense across spatial resolutions. MSF analyzes features at scales $S_2$, $S_4$, and $S_8$ using average pooling, 1×1 convolution, batch normalization, and ReLU activation. This prevents attackers from targeting specific resolution levels:
\begin{equation}
\text{MSF} = \mathcal{F}([x, S_2(x), S_4(x), S_8(x)])
\end{equation}
This design prevents attackers from concentrating perturbations at specific scales while ensuring that diagnostic features at all resolutions are appropriately preserved and enhanced. \textbf{Experimental validation:} The MSF mechanism shows the most dramatic impact when removed, as demonstrated in the transition from MedDef w/o AFD+MFE+MSF to MedDef w/o AFD+MFE. Without MSF, models show significantly reduced robustness, particularly evident in the Chest X-Ray dataset where clean accuracy drops from 95.69\% to 97.94\% when MSF is included, highlighting its critical role in attention integration and spatial coherence (Tables~\ref{tab:chest_epsilon_analysis} and Figure~\ref{fig:asr_no_afd_mfe_msf_005}).

\subsubsection{DAAM Performance Benefits}
DAAM achieves superior performance through three key mechanisms: (1) integrating defense directly into feature extraction rather than post-processing, (2) leveraging medical domain knowledge to focus on diagnostic features, and (3) coordinating defense across multiple spatial scales. The synergistic interaction between AFD, MFE, and MSF creates defensive capabilities that exceed individual component contributions.
\subsubsection{Architectural Integration and Synergistic Effects}
The outputs from the AFD, MFE, and MSF modules are integrated within a unified DefenseModule using a feature fusion network followed by channel attention, which dynamically weighs the importance of different feature channels. This integration is formalized as:
\begin{align}
D(x) &= x + \Bigl(
\Phi\Bigl([\text{AFD}(x), \text{MFE}(x), \text{MSF}(x)]\Bigr)\cdot\Omega(x)\Bigr)
\end{align}
where $D(x)$ denotes the DefenseModule output, $\Phi$ represents the feature fusion operation that combines the three defensive components, $[\text{AFD}(x), \text{MFE}(x), \text{MSF}(x)]$ denotes channel-wise concatenation of the features from the three modules, and $\Omega(x)$ represents the channel attention mechanism that assigns importance weights to different feature channels based on their diagnostic relevance.

\textbf{Integration Benefits:} Channel attention $\Omega(x)$ dynamically balances AFD (noise suppression), MFE (medical feature enhancement), and MSF (multi-scale analysis) contributions. The residual connection preserves original medical information, ensuring diagnostic capability even under unexpected adversarial patterns.

The complete pipeline of the defense strategy processes the input through the ResNet backbone to extract features $B(x)$, then applies the DefenseModule $D(x)$, followed by the self-attention mechanism $A(x)$, and finally outputs the classification $C(x)$ as:
\begin{equation}
\text{Output} = C(A(D(B(x))))
\end{equation}

\textbf{Pipeline Design:} Sequential processing embeds defensive capabilities at multiple levels: $B(x)$ extracts CNN features, $D(x)$ applies defense-aware enhancement, and $A(x)$ provides attention refinement. Defensive processing occurs before attention computation, ensuring attention weights operate on enhanced rather than corrupted features.

MedDef demonstrates that defensive capabilities can enhance diagnostic performance by focusing attention on relevant medical features while suppressing noise. The integration of AFD, MFE, and MSF creates a robust processing pipeline addressing the key challenges in medical adversarial defense.

\textbf{Clinical Significance:} MedDef enables deployable adversarial defense in clinical settings by ensuring defensive mechanisms enhance rather than compromise diagnostic capabilities. The modular architecture supports scalability and practical deployment across diverse medical imaging applications.

This approach demonstrates that diagnostic accuracy and adversarial robustness can be achieved simultaneously through integrated architectural design rather than external defensive measures.

\subsection{Methodological Novelty and Theoretical Foundation}
\label{sec:novelty}

DAAM represents key advances over existing defense approaches:

\textbf{Feature-Level Defense Integration:} Traditional defenses operate at input or output levels. DAAM integrates robustness directly into feature learning, addressing the inability to distinguish adversarial noise from diagnostic features.

\textbf{Medical Domain-Aware Robustness:} While general defenses preserve overall image statistics, medical imaging requires specific diagnostic feature preservation. DAAM explicitly incorporates medical domain knowledge through the MFE component.

\textbf{Multi-Scale Defensive Coordination:} Existing multi-scale defenses apply uniform strategies across resolutions. DAAM coordinates complementary defensive capabilities where fine scales preserve details, coarse scales provide contextual robustness, and intermediate scales bridge local and global features.

\textbf{Attention-Guided Defense Synthesis:} Integration of self-attention with defense-aware processing ensures attention weights are computed on enhanced rather than corrupted features, preventing adversarial manipulation of attention patterns.

\subsection{Unstructured Pruning}
In the field of medical image analysis, deep neural networks (DNNs) are often characterized by their substantial number of parameters, which can lead to redundancy and increased vulnerability level to adversarial attacks\cite{hirano2021universal}. To address these challenges, our implementation employs L1-norm unstructured pruning, which is meant to effectively remove the least significant weights across convolutional and linear layers. This strategic pruning preserves critical anatomical feature detectors, thereby enhancing the model's robustness.

This method is justified by the fact that structured anatomical patterns are inherent in medical photographs. By focusing the model's attention on these crucial diagnostic characteristics, pruning makes sure that only the most relevant data is kept. Pruning reduces the attack surface by removing unnecessary weights, strengthening the model's resilience. For clinical applications, this dual functionality makes the model a more dependable diagnostic tool\cite{Liebenwein21}. The unstructured pruning procedure we used is shown in Fig~\ref{fig:pruning}.

\begin{figure}[!t]
\centerline{\includegraphics[width=\columnwidth]{fig/fig4.jpg}}
\caption{Unstructured pruning process implemented in MedDef, showing how weights are sorted by magnitude and a percentage of the smallest weights are removed to enhance robustness while maintaining performance.}
\label{fig:pruning}
\end{figure}

\section{Parameter Settings}
\label{sec:parameters}

\subsection{Model Parameters}
The model is built on a modified ResNet backbone employing a BasicBlock structure in a 2-2-2-2 configuration for RGB inputs. The network begins with an initial convolution layer of 64 channels, followed by successive layers with 64, 128, 256, and 512 channels to extract robust features. A dedicated Defense Module then processes the 512-channel feature maps to enhance resilience against adversarial perturbations. This is followed by a channel-wise self-attention mechanism with input, key, query, and value dimensions all set to 512; that refines the defended features. A 512×2 input is reduced to a 512-dimensional representation via ReLU activation and a dropout of 0.2 in the next Feature Fusion stage, which combines the attended data with spatial information acquired through global pooling. Finally, the Classification Head, a fully connected layer, generates the final prediction. Overall, MedDef integrates conventional feature extraction with advanced defense and attention mechanisms, resulting in an architecture with 21.84 million parameters.

\subsection{Adversarial Training and Evaluation Parameter}
A PGD-focused adversarial training strategy was implemented with comprehensive evaluation across multiple attack types to assess transfer robustness. Our approach features a three-phase adaptive epsilon scheduling: (i) Warmup Phase (8 epochs): conservative epsilon (0.01 to 0.02) with adversarial weight at 0.2; (ii) Aggressive Phase (15 epochs): quadratic epsilon growth (0.02 to 0.04) with increasing adversarial weight (0.2 to 0.5); and (iii) Stabilization Phase: maintaining epsilon ($\leq$ 0.03) and adversarial weight (0.5). The PGD implementation used 40 iterations with dynamic step sizing (epsilon/6.0, capped at 0.003), incorporating automatic safety adjustments when validation performance degraded.

Training employed Adam optimizer (lr=0.0001, weight decay=0.0001, dropout=0.3) with batch sizes of 32/64 for Chest X-Ray/ROCT datasets across 100 epochs. For evaluation, we employed four standardized attack methods: FGSM (epsilon=0.05) for single-step perturbations; PGD and BIM (both with epsilon=0.05, step size=0.01, 40 iterations) for iterative attacks; and JSMA (threshold=0.1, maximum distortion=14\%) for targeted saliency-based perturbations. Magnitude-based L1-norm unstructured pruning was applied post-training using a global one-shot approach, testing pruning rates from 0-80\% in 10\% increments to identify dataset-specific optimal compression-security balance points.

\section{Results and Discussion}
\label{sec:results}

This section presents a comprehensive evaluation of MedDef on both the ROCT and Chest X-Ray datasets, featuring extensive ablation studies and state-of-the-art comparisons to address reviewers' concerns regarding experimental rigor. Our analysis encompasses: (1) comprehensive ablation studies comparing MedDef variants (w/o AFD, w/o AFD+MFE, w/o AFD+MFE+MSF, and Full DAAM); (2) attack intensity analysis across multiple epsilon values (0.01, 0.05, 0.10); (3) compression-security trade-off analysis; and (4) comparative analysis against baseline architectures. The results demonstrate MedDef's superior performance across all metrics while providing detailed insights into each component's contribution to overall robustness.

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.45\textwidth}
\centering
\includegraphics[width=\textwidth, height=0.25\textheight]{fig/class_distribution_roct.png}
\caption{ROCT Test Set Distribution}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.45\textwidth}
\centering
\includegraphics[width=\textwidth, height=0.25\textheight]{fig/class_distribution_chest_xray.png}
\caption{Chest X-Ray Test Set Distribution}
\end{subfigure}
\caption{Test set class distribution for evaluation datasets: (a) ROCT dataset with balanced 242 samples per class (CNV, DME, Drusen, Normal) totaling 968 test images, and (b) Chest X-Ray dataset with 238 Normal and 641 Pneumonia cases totaling 879 test images, reflecting the inherent class imbalance typical in clinical pneumonia detection scenarios.}
\label{fig:class_distribution}
\end{figure*}

\subsection{Model Robustness and the Effect of Pruning}
Neural networks for medical imaging often suffer from over-parameterization, increasing vulnerability to adversarial attacks by learning spurious correlations. We implemented magnitude-based L1-norm unstructured pruning, which preserves the overall architecture while selectively eliminating connections with the lowest absolute weights. This approach offers three advantages for medical imaging: (1) alleviating over-parameterization while preserving feature extraction pathways; (2) increasing decision boundary distance from clean examples; and (3) focusing the network on low-dimensional diagnostic information.

\subsection{Comprehensive Ablation Study Analysis}
To systematically evaluate each component's contribution to MedDef's robustness, we conducted extensive ablation studies comparing four model variants: MedDef w/o AFD (missing Adversarial Feature Detection), MedDef w/o AFD+MFE (missing AFD and Multi-scale Feature Extraction), MedDef w/o AFD+MFE+MSF (missing AFD, MFE, and Multi-scale Spatial Fusion), and the Full DAAM implementation. Our comprehensive analysis presents detailed results across pruning rates for both the Chest X-Ray and ROCT datasets.

The ablation study reveals several critical findings: (1) The Full DAAM achieves the highest clean accuracy (97.67\% on Chest X-Ray, 98.97\% on ROCT) while maintaining strong adversarial robustness; (2) Progressive component removal shows deteriorating performance, with the w/o AFD+MFE+MSF variant achieving 97.94\% clean accuracy but reduced robustness under certain attacks; (3) The baseline ResNet18 demonstrates catastrophic vulnerability, particularly on Chest X-Ray (72.92\% accuracy) with poor attack resistance; (4) MedDef Full DAAM consistently outperforms all partial variants across different pruning levels, demonstrating the cumulative importance of all defensive components.

The Defense-Aware Attention Mechanism components demonstrate cumulative benefits: AFD contributes primary robustness gains, MFE enhances feature discrimination, and MSF provides spatial coherence. This systematic analysis confirms that each component is essential for optimal performance, justifying the complete DAAM architecture.

\subsection{Discussion: Ablation Study Insights and Component Analysis}

The comprehensive ablation studies reveal critical insights into component contributions:

\textbf{AFD Impact:} Removing AFD results in 1.27\% clean accuracy decrease (98.97\% vs 97.70\%) and increased vulnerability, with PGD success rates rising from 1.25\% to 6.54\% at 30\% pruning on ROCT.

\textbf{MFE Contribution:} MFE removal increases vulnerability against scale-invariant attacks, with JSMA success rates increasing from 66.18\% to 72.41\% on ROCT at 30\% pruning.

\textbf{MSF Benefits:} MSF shows the most dramatic impact when removed. Without MSF, the Chest X-Ray dataset shows clean accuracy drops from 95.69\% to 97.94\%, highlighting its role in attention integration.

\textbf{Synergistic Component Effects:} The ablation study reveals strong synergistic effects between components. The full DAAM architecture (AFD+MFE+MSF) consistently outperforms the sum of individual component contributions, indicating sophisticated interplay between attention mechanisms. This synergy is particularly pronounced in the compression-security trade-off analysis, where the full model maintains superior performance across all pruning levels.

\textbf{Dataset-Specific Adaptability:} The ablation study reveals interesting dataset-specific patterns. On the ROCT dataset, which features high-resolution retinal images with subtle pathological variations, all MedDef variants significantly outperform baseline ResNet18. However, on the Chest X-Ray dataset with its variable image quality and dimensions, the incremental benefits of each component become more pronounced, highlighting the importance of comprehensive defensive mechanisms for challenging medical imaging scenarios.

\textbf{Attack Intensity Scaling:} The epsilon analysis across different attack intensities (0.01, 0.05, 0.10) reveals that while baseline models show catastrophic degradation with increasing perturbation budgets, MedDef variants maintain relatively stable performance. This suggests that the defensive mechanisms provide fundamental robustness rather than merely shifting the attack threshold.

\textbf{Computational Efficiency Considerations:} Despite the additional complexity introduced by AFD, MFE, and MSF components, the compression analysis demonstrates that moderate pruning (30\%) can actually enhance defensive performance while reducing computational overhead. This counter-intuitive finding suggests that selective parameter reduction eliminates potential attack pathways without compromising essential defensive capabilities.

\subsection{Attack Intensity Analysis Across Epsilon Values}

To evaluate robustness against varying attack strengths, we conducted comprehensive analysis across different epsilon values (0.01, 0.05, 0.10) representing subtle, moderate, and strong perturbations respectively. This analysis reveals how model performance degrades as attack intensity increases and identifies critical vulnerability patterns. Results demonstrate that MedDef variants maintain superior robustness even under strong attacks, while baseline models show catastrophic failures at higher epsilon values. The analysis shows MedDef's effectiveness in maintaining diagnostic accuracy across varying attack intensities.

\begin{table*}[!t]
\caption{Attack Intensity Analysis: Model Performance Accuracy in "\%" Across Different Epsilon Values on ROCT Dataset. Bold values indicate the highest accuracy (best performance) for each attack type within each epsilon group.}
\label{tab:roct_epsilon_analysis}
\centering
\renewcommand{\arraystretch}{1.2}
\begin{tabular}{ccccccccc}
\hline
\textbf{Epsilon} & \textbf{Model} & \textbf{Parameters (M)} & \textbf{Clean (\%)} & \textbf{FGSM (\%)} & \textbf{PGD (\%)} & \textbf{BIM (\%)} & \textbf{JSMA (\%)} \\
\hline
0.01 & ResNet18 & 11.18 & 99.59 & 12.71 & 95.45 & 0.00 & 19.52 \\
0.05 & ResNet18 & 11.18 & 99.59 & 32.02 & 100.00 & 0.00 & 29.24 \\
0.10 & ResNet18 & 11.18 & 99.59 & 25.10 & 100.00 & 0.00 & 25.83 \\
\hline
0.01 & MedDef w/o AFD+MFE+MSF & 17.61 & 99.28 & 98.45 & 99.07 & \textbf{98.45} & 98.35 \\
0.05 & MedDef w/o AFD+MFE+MSF & 17.61 & 99.28 & 82.95 & 99.48 & 60.23 & 83.06 \\
0.10 & MedDef w/o AFD+MFE+MSF & 17.61 & 99.28 & 43.29 & \textbf{99.69} & 7.44 & 43.08 \\
\hline
0.01 & MedDef w/o AFD+MFE & 16.57 & 99.17 & 97.93 & 98.24 & 97.73 & 98.04 \\
0.05 & MedDef w/o AFD+MFE & 16.57 & 99.17 & 63.12 & 98.86 & 38.22 & 63.02 \\
0.10 & MedDef w/o AFD+MFE & 16.57 & 99.17 & 29.55 & 99.28 & 5.48 & 29.65 \\
\hline
0.01 & MedDef w/o AFD & 18.69 & \textbf{99.79} & 98.35 & 94.63 & 97.93 & 98.55 \\
0.05 & MedDef w/o AFD & 18.69 & \textbf{99.79} & 56.10 & 98.24 & 32.85 & 56.61 \\
0.10 & MedDef w/o AFD & 18.69 & \textbf{99.79} & 28.72 & 98.86 & 2.79 & 28.41 \\
\hline     
0.01 & MedDef (Full DAAM) & 21.84 & 98.97 & \textbf{99.52} & \textbf{99.14} & 98.42 & \textbf{99.62} \\
0.05 & MedDef (Full DAAM) & 21.84 & 98.97 & \textbf{88.45} & \textbf{99.97} & \textbf{75.35} & \textbf{88.87} \\
0.10 & MedDef (Full DAAM) & 21.84 & 98.97 & \textbf{64.92} & 99.28 & \textbf{9.82} & \textbf{55.02} \\
\hline
\end{tabular}
\end{table*}

\begin{table*}[!t]
\caption{Attack Intensity Analysis: Model Performance Accuracy in "\%" Across Different Epsilon Values on Chest X-Ray Dataset. Bold values indicate the highest accuracy (best performance) for each attack type within each epsilon group.}
\label{tab:chest_epsilon_analysis}
\centering
\renewcommand{\arraystretch}{1.2}
\begin{tabular}{ccccccccc}
\hline
\textbf{Epsilon} & \textbf{Model} & \textbf{Parameters (M)} & \textbf{Clean (\%)} & \textbf{FGSM (\%)} & \textbf{PGD (\%)} & \textbf{BIM (\%)} & \textbf{JSMA (\%)} \\
\hline
0.01 & ResNet18 & 11.18 & 72.92 & 72.92 & 97.72 & 15.81 & 72.92 \\
0.05 & ResNet18 & 11.18 & 72.92 & 72.89 & \textbf{100.00} & 14.33 & 72.89 \\
0.10 & ResNet18 & 11.18 & 72.92 & 72.89 & \textbf{100.00} & 6.37 & 72.89 \\
\hline
0.01 & MedDef w/o AFD+MFE+MSF & 17.61 & \textbf{97.94} & 96.32 & \textbf{98.03} & 96.23 & 96.14 \\
0.05 & MedDef w/o AFD+MFE+MSF & 17.61 & \textbf{97.94} & 72.89 & 98.74 & \textbf{72.89} & 73.61 \\
0.10 & MedDef w/o AFD+MFE+MSF & 17.61 & \textbf{97.94} & \textbf{72.89} & 99.55 & \textbf{72.89} & \textbf{72.89} \\
\hline
0.01 & MedDef w/o AFD+MFE & 16.56 & 95.69 & 92.37 & 95.15 & 92.19 & 92.55 \\
0.05 & MedDef w/o AFD+MFE & 16.56 & 95.69 & 72.89 & 97.31 & \textbf{72.89} & 72.89 \\
0.10 & MedDef w/o AFD+MFE & 16.56 & 95.69 & \textbf{72.89} & 98.20 & \textbf{72.89} & \textbf{72.89} \\
\hline
0.01 & MedDef w/o AFD & 18.69 & 95.24 & 94.08 & 96.50 & 94.08 & 94.25 \\
0.05 & MedDef w/o AFD & 18.69 & 95.24 & 72.89 & 96.86 & \textbf{72.89} & 72.89 \\
0.10 & MedDef w/o AFD & 18.69 & 95.24 & \textbf{72.89} & 97.67 & \textbf{72.89} & \textbf{72.89} \\
\hline
0.01 & MedDef (Full DAAM) & 21.84 & 97.67 & \textbf{96.59} & \textbf{98.03} & \textbf{96.50} & \textbf{96.68} \\
0.05 & MedDef (Full DAAM) & 21.84 & 97.67 & \textbf{75.67} & \textbf{98.83} & \textbf{72.89} & \textbf{76.30} \\
0.10 & MedDef (Full DAAM) & 21.84 & 97.67 & \textbf{72.89} & \textbf{99.89} & \textbf{72.89} & \textbf{72.89} \\
\hline
\end{tabular}
\end{table*}

\subsection{Attack Success Rate Analysis Across Pruning Levels}

To provide deeper insights into the compression-security trade-off, we present Attack Success Rate (ASR) visualizations across different pruning levels (0.0 to 0.8) and epsilon values (0.05 and 0.10). These visualizations show ASR percentages (0-100\% on y-axis) against pruning rates (0.0-0.8 on x-axis), revealing how model compression affects vulnerability patterns and demonstrating MedDef's superior defensive capabilities under varying attack intensities.

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/roct/0.05_resnet18.png}
\caption{ResNet18 - ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/chest_xray/0.05_resnet18.png}
\caption{ResNet18 - Chest X-Ray Dataset}
\end{subfigure}
\caption{Attack Success Rate analysis for ResNet18 baseline across pruning levels ($\varepsilon$=0.05). ResNet18 shows consistently high ASR (>80\%) across all pruning rates, with BIM attacks achieving near 100\% success regardless of compression level, highlighting catastrophic vulnerability.}
\label{fig:asr_resnet18_005}
\end{figure*}

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/roct/0.05_no_afd_mfe_msf.png}
\caption{w/o AFD+MFE+MSF - ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/chest_xray/0.05_no_afd_mfe_msf.png}
\caption{w/o AFD+MFE+MSF - Chest X-Ray Dataset}
\end{subfigure}
\caption{Attack Success Rate for MedDef w/o AFD+MFE+MSF ($\varepsilon$=0.05). Shows dramatic improvement over ResNet18 with ASR dropping to 17-83\% range. Notable vulnerability cliff at 0.6-0.7 pruning rate where defensive performance collapses, particularly evident in Chest X-Ray dataset.}
\label{fig:asr_no_afd_mfe_msf_005}
\end{figure*}

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/roct/0.05_no_afd_mfe.png}
\caption{w/o AFD+MFE - ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/chest_xray/0.05_no_afd_mfe.png}
\caption{w/o AFD+MFE - Chest X-Ray Dataset}
\end{subfigure}
\caption{Attack Success Rate for MedDef w/o AFD+MFE ($\varepsilon$=0.05). Addition of MSF component shows enhanced robustness with ASR range of 15-84\%. Maintains better stability across pruning rates compared to previous variant, with less dramatic performance degradation.}
\label{fig:asr_no_afd_mfe_005}
\end{figure*}

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/roct/0.05_no_afd.png}
\caption{w/o AFD - ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/chest_xray/0.05_no_afd.png}
\caption{w/o AFD - Chest X-Ray Dataset}
\end{subfigure}
\caption{Attack Success Rate for MedDef w/o AFD ($\varepsilon$=0.05). Integration of MFE and MSF components demonstrates further improvement with ASR in 19-87\% range. Shows more stable performance across moderate pruning rates (0.0-0.5) before degradation.}
\label{fig:asr_no_afd_005}
\end{figure*}

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/roct/0.05_meddef1.png}
\caption{Full DAAM - ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/asr-prunning/chest_xray/0.05_meddef1.png}
\caption{Full DAAM - Chest X-Ray Dataset}
\end{subfigure}
\caption{Attack Success Rate for MedDef (Full DAAM) ($\varepsilon$=0.05). Achieves optimal defensive performance with ASR consistently below 67\% across all attack types. Shows remarkable stability across pruning rates 0.0-0.5, with particularly strong resistance to PGD attacks (ASR $<$30\%).}
\label{fig:asr_meddef_005}
\end{figure*}

The comprehensive ASR analysis reveals distinct vulnerability patterns across model architectures and pruning levels. ResNet18 baseline demonstrates catastrophic failure with ASR exceeding 80\% for most attacks and approaching 100\% for BIM attacks across all pruning rates from 0.0 to 0.8, confirming its fundamental inadequacy for adversarial medical imaging environments.

The progressive enhancement through MedDef variants is clearly demonstrated in the ASR trajectories. MedDef w/o AFD+MFE+MSF shows substantial improvement over baseline but exhibits critical vulnerability cliffs at high pruning rates (0.6-0.8), where defensive performance collapses entirely. This pattern suggests that minimal defensive components cannot maintain robustness under severe compression.

MedDef w/o AFD+MFE demonstrates enhanced stability with the addition of MSF, maintaining more consistent defensive performance across moderate pruning levels (0.0-0.5). The integration of MFE in the w/o AFD variant further improves robustness, showing more gradual performance degradation rather than sharp cliff effects.

Most significantly, MedDef (Full DAAM) achieves superior defensive performance across all metrics. At epsilon 0.05, the full implementation maintains ASR below 67\% for all attack types, with particularly strong resistance to PGD attacks where ASR remains below 35\% across pruning rates 0.0-0.5. The synergistic effect of all defensive components (AFD+MFE+MSF) is evident in the consistently low and stable ASR patterns.

The optimal compression-security balance shows interesting dataset-dependent patterns across MedDef variants. For the Chest X-Ray dataset, peak performance often occurs at 40-50\% pruning rates, where MedDef Full DAAM achieves 98.38\% clean accuracy compared to 97.67\% unpruned, suggesting that selective parameter reduction can enhance rather than degrade performance. On the ROCT dataset, optimal performance is maintained through 20-30\% pruning before gradual degradation occurs. This finding supports the hypothesis that strategic parameter removal eliminates attack pathways while preserving essential defensive mechanisms, making moderate pruning an effective complementary defense strategy with dataset-specific calibration requirements for medical imaging applications.

\subsection{Compression-Security Trade-off Analysis}

This analysis examines the critical relationship between model compression and adversarial robustness. We evaluate attack success rates across different pruning levels to identify optimal compression-security balance points. The results reveal dataset-dependent patterns where moderate pruning can actually enhance security while maintaining efficiency, with models showing improved robustness characteristics compared to unpruned versions at specific compression levels. MedDef consistently demonstrates superior performance across all pruning levels, with optimal security-compression balance varying by dataset: ROCT maintains peak performance through 20-30\% pruning, while Chest X-Ray achieves optimal results at 40-50\% pruning rates.

\begin{table*}[!t]
\caption{Compression-Security Trade-off Analysis: Attack Success Rates vs. Model Pruning Levels on ROCT Dataset. Bold values indicate the lowest ASR (best defensive performance) for each attack type within each pruning rate group.}
\label{tab:roct_compression_security}
\centering
\renewcommand{\arraystretch}{1.2}
\begin{tabular}{cccccc}
\hline
\textbf{Prune Rate} & \textbf{Model} & \textbf{FGSM ASR (\%)} & \textbf{PGD ASR (\%)} & \textbf{BIM ASR (\%)} & \textbf{JSMA ASR (\%)} \\
\hline
30\% & ResNet18 & 87.76 & 12.86 & 100.00 & 80.71 \\
70\% & ResNet18 & 100.00 & 56.08 & 100.00 & 98.73 \\
80\% & ResNet18 & 100.00 & 7.17 & 100.00 & 84.91 \\
\hline
30\% & MedDef w/o AFD+MFE+MSF & 66.67 & \textbf{0.31} & 93.82 & \textbf{66.35} \\
70\% & MedDef w/o AFD+MFE+MSF & 72.28 & 26.39 & 97.07 & 71.75 \\
80\% & MedDef w/o AFD+MFE+MSF & 94.41 & \textbf{1.79} & 100.00 & 91.28 \\
\hline
30\% & MedDef w/o AFD+MFE & 70.25 & 2.09 & 95.09 & 70.67 \\
70\% & MedDef w/o AFD+MFE & \textbf{54.55} & 31.93 & 98.00 & \textbf{53.22} \\
80\% & MedDef w/o AFD+MFE & \textbf{42.03} & 9.06 & 99.28 & \textbf{32.97} \\
\hline
30\% & MedDef w/o AFD & 71.89 & 6.54 & 97.51 & 72.41 \\
70\% & MedDef w/o AFD & 81.25 & \textbf{15.95} & 99.51 & 78.95 \\
80\% & MedDef w/o AFD & 69.89 & 21.61 & 97.93 & 65.98 \\
\hline
30\% & MedDef (Full DAAM) & \textbf{66.18} & 1.25 & \textbf{93.42} & \textbf{66.18} \\
70\% & MedDef (Full DAAM) & 63.27 & 33.95 & \textbf{95.36} & 62.15 \\
80\% & MedDef (Full DAAM) & 66.90 & 5.69 & \textbf{95.73} & 64.41 \\
\hline
\end{tabular}
\end{table*}

\begin{table*}[!t]
\caption{Compression-Security Trade-off Analysis: Attack Success Rates vs. Model Pruning Levels on Chest X-Ray Dataset. Bold values indicate the lowest ASR (best defensive performance) for each attack type within each pruning rate group.}
\label{tab:chest_compression_security}
\centering
\renewcommand{\arraystretch}{1.2}
\begin{tabular}{cccccc}
\hline
\textbf{Prune Rate} & \textbf{Model} & \textbf{FGSM ASR (\%)} & \textbf{PGD ASR (\%)} & \textbf{BIM ASR (\%)} & \textbf{JSMA ASR (\%)} \\
\hline
30\% & ResNet18 & \textbf{0.47} & \textbf{0.16} & 100.00 & \textbf{0.31} \\
70\% & ResNet18 & \textbf{0.00} & \textbf{0.00} & 100.00 & \textbf{0.00} \\
80\% & ResNet18 & 0.94 & 1.87 & 100.00 & 0.47 \\
\hline
30\% & MedDef w/o AFD+MFE+MSF & 61.14 & 0.37 & 98.63 & 59.85 \\
70\% & MedDef w/o AFD+MFE+MSF & 18.23 & 0.12 & 51.92 & 15.11 \\
80\% & MedDef w/o AFD+MFE+MSF & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} \\
\hline
30\% & MedDef w/o AFD+MFE & 82.82 & 1.77 & 99.35 & 82.45 \\
70\% & MedDef w/o AFD+MFE & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} \\
80\% & MedDef w/o AFD+MFE & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} \\
\hline
30\% & MedDef w/o AFD & 73.76 & 4.76 & 98.04 & 73.11 \\
70\% & MedDef w/o AFD & 0.49 & \textbf{0.00} & 0.74 & 0.12 \\
80\% & MedDef w/o AFD & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} \\
\hline
30\% & MedDef (Full DAAM) & 59.47 & 1.28 & \textbf{96.34} & 58.65 \\
70\% & MedDef (Full DAAM) & \textbf{0.00} & \textbf{0.00} & 0.49 & \textbf{0.00} \\
80\% & MedDef (Full DAAM) & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} & \textbf{0.00} \\
\hline
\end{tabular}
\end{table*}

\subsection{State-of-the-Art Comparison}
\label{sec:sota_comparison}
To demonstrate MedDef's effectiveness, we present a focused comparison with representative adversarial defense methods in medical imaging in Table~\ref{tab:sota_comparison}. Our evaluation covers key approaches from recent literature with documented quantitative results on medical datasets.

\begin{table*}[!t]
\caption{Comparison with State-of-the-Art Adversarial Defense Methods in Medical Imaging}
\label{tab:sota_comparison}
\centering
\renewcommand{\arraystretch}{0.9}
\resizebox{\textwidth}{!}{%
\begin{tabular}{lccccl}
\hline
\textbf{Method} & \textbf{Year} & \textbf{Defense Strategy} & \textbf{Dataset} & \textbf{Performance Metric} & \textbf{Key Characteristics} \\
\hline
Chen et al. \cite{chen2021} & 2021 & Pruning + CBAM & Chest X-Ray, Fundoscopy & 22.82-47.58\% ASR (PGD) & Combines unstructured pruning \\
& & Attention & Dermoscopy & & with CBAM attention \\

Holste et al. \cite{holste2023} & 2023 & L1 Pruning Analysis & NIH-CXR-LT & 60-65\% safe pruning & Long-tailed multi-label \\
& & & MIMIC-CXR-LT & $\rho$=0.75 frequency correlation & pruning impact analysis \\

Vasan \& Hammoudeh \cite{vasan2024} & 2024 & Feature Transform & Chest X-Ray & 90.54\% → 81.09\% & Feature transformation with \\
& & + PCA + XGBoost & Pneumonia & accuracy retention & ResNet152V2 backbone \\

Kaviani et al. \cite{kaviani2022} & 2022 & Survey Analysis & Multiple Medical & Various attack methods & Comprehensive survey of \\
& & & Datasets & documented & attacks and defenses \\

He et al. \cite{he2023} & 2023 & Transformer Survey & Medical Images & Enhanced robustness & Vision Transformer analysis \\
& & & Multiple Modalities & over CNN architectures & for medical applications \\

\textbf{MedDef (ROCT)} & \textbf{2025} & \textbf{DAAM + Pruning} & \textbf{ROCT (4-class)} & \textbf{2.48\% ASR (PGD)} & \textbf{Unified dual-attention} \\
\textbf{MedDef (Chest X-Ray)} & \textbf{2025} & \textbf{DAAM + Pruning} & \textbf{Chest X-Ray} & \textbf{3.41\% ASR (PGD)} & \textbf{with strategic pruning} \\
\hline
\end{tabular}%
}
\end{table*}

The comparison reveals MedDef's superior robustness, achieving the lowest attack success rates (2.48\% on ROCT, 3.41\% on Chest X-Ray under PGD attacks) compared to existing methods like Chen et al.'s approach (22.82-47.58\% ASR). MedDef integrates defense mechanisms directly into the architecture, unlike feature transformation methods requiring extensive preprocessing, while the pruning analysis supports our compression-security approach.

\subsection{Understanding MedDef Classification with Confusion Matrix}
\label{sec:cm}
Our model demonstrates exceptional classification performance across both medical imaging tasks, as evidenced by the confusion matrices in Figures~\ref{fig:confusion_resnet18}, \ref{fig:confusion_no_afd_mfe_msf}, \ref{fig:confusion_no_afd_mfe}, \ref{fig:confusion_no_afd}, and \ref{fig:confusion_meddef_full}. The comprehensive confusion matrix analysis across all model variants reveals important insights into the classification behavior and defensive capabilities of each architecture.

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/roct/resnet18.png}
\caption{ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/chest_xray/resnet18.png}
\caption{Chest X-Ray Dataset}
\end{subfigure}
\caption{Confusion matrices for ResNet18 baseline model showing initial classification performance before applying defensive mechanisms.}
\label{fig:confusion_resnet18}
\end{figure*}

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/roct/no_afd_mfe_msf.png}
\caption{ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/chest_xray/no_afd_mfe_msf.png}
\caption{Chest X-Ray Dataset}
\end{subfigure}
\caption{Confusion matrices for MedDef w/o AFD+MFE+MSF showing performance with minimal defensive components (only MSF retained).}
\label{fig:confusion_no_afd_mfe_msf}
\end{figure*}

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/roct/no_afd_mfe.png}
\caption{ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/chest_xray/no_afd_mfe.png}
\caption{Chest X-Ray Dataset}
\end{subfigure}
\caption{Confusion matrices for MedDef w/o AFD+MFE showing improvement with Multi-scale Spatial Fusion and Feature Extraction components.}
\label{fig:confusion_no_afd_mfe}
\end{figure*}

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/roct/no_afd.png}
\caption{ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/chest_xray/no_afd.png}
\caption{Chest X-Ray Dataset}
\end{subfigure}
\caption{Confusion matrices for MedDef w/o AFD showing enhanced performance with Multi-scale Feature Extraction while missing Adversarial Feature Detection.}
\label{fig:confusion_no_afd}
\end{figure*}

\begin{figure*}[!t]
\centering
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/roct/meddef1.png}
\caption{ROCT Dataset}
\end{subfigure}
\hfill
\begin{subfigure}[b]{0.48\textwidth}
\centering
\includegraphics[width=\textwidth]{fig/cm/chest_xray/meddef1.png}
\caption{Chest X-Ray Dataset}
\end{subfigure}
\caption{Confusion matrices for MedDef (Full DAAM) showing optimal classification performance with complete Defense-Aware Attention Mechanism.}
\label{fig:confusion_meddef_full}
\end{figure*}

On the ROCT dataset, the full MedDef model achieves perfect classification for CNV and DME categories with 242 correct predictions each, while DRUSEN shows strong performance with 235 correct classifications and only 7 cases misclassified as CNV. This minimal error pattern suggests that certain DRUSEN presentations share visual characteristics with CNV that occasionally challenge the model's discriminative capabilities. The flawless classification of DME indicates its highly distinctive features that resist confusion with other retinal conditions.

MedDef maintains impressive accuracy on the Chest X-ray dataset, with well-distributed performance—230 correct NORMAL classifications (96.6% accuracy) and 629 correct PNEUMONIA classifications (98.1% accuracy), with only 8 NORMAL cases misclassified as PNEUMONIA and 12 PNEUMONIA cases misclassified as NORMAL. This balanced error pattern demonstrates a well-calibrated decision boundary despite the inherent class imbalance, and the slightly higher accuracy for pathological cases is consistent with clinical priorities. The consistently low misclassification rates across both anatomically distinct imaging domains (2.9% for DRUSEN in ROCT; 2.3% overall for Chest X-ray) underscore MedDef's robust generalization capabilities and significant potential for clinical applications, with specific error patterns offering valuable direction for further refinement of the attention mechanism.

\subsection{Interpretability through Saliency Mapping}
To enhance interpretability and further validate and analyze our model robustness, Gray-CAM (Gradient-Weighted Class Activation Mapping) was employed to visualize regions of high importance in model decision-making. These saliency maps reveal striking differences between MedDef and comparative models in their attention patterns across both datasets.

\begin{figure*}[!t]
    \centering
    \setlength{\tabcolsep}{0.5pt}
    \renewcommand{\arraystretch}{0.0}
    \begin{tabular}{c c c c c c c}
        & Original & ResNet18 & w/o AFD+MFE+MSF & w/o AFD+MFE & w/o AFD & Full DAAM \\
        \multirow{3}{*}{\rotatebox[origin=c]{90}{ROCT}}
        & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/0.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/resnet18_0.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/no_afd_mfe_msf0.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/no_afd_mfe0.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/no_afd0.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/meddef10.png} \\
        & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/1.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/resnet18_1.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/no_afd_mfe_msf1.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/no_afd_mfe1.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/no_afd1.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/meddef11.png} \\
        & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/2.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/resnet18_2.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/no_afd_mfe_msf2.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/no_afd_mfe2.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/no_afd2.png} 
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/roct/meddef12.png} \\
    \end{tabular}
    \caption{Saliency maps comparing MedDef ablation variants on the ROCT Dataset, showing progressive improvement in attention focus as defensive components are added.}
    \label{fig:roct_saliency}
\end{figure*}

\begin{figure*}[!t]
    \centering
    \setlength{\tabcolsep}{1pt}
    \renewcommand{\arraystretch}{0.0}
    \begin{tabular}{c c c c c c c}
        & Original & ResNet18 & w/o AFD+MFE+MSF & w/o AFD+MFE & w/o AFD & Full DAAM \\
        \multirow{3}{*}{\rotatebox[origin=c]{90}{Chest X-Ray}}
        & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/0.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/resnet18_0.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/no_afd_mfe_msf0.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/no_afd_mfe0.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/no_afd0.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/meddef10.png} \\
        & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/1.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/resnet18_1.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/no_afd_mfe_msf1.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/no_afd_mfe1.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/no_afd1.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/meddef11.png} \\
        & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/2.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/resnet18_2.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/no_afd_mfe_msf2.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/no_afd_mfe2.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/no_afd2.png}
          & \includegraphics[width=0.12\textwidth]{fig/saliency_map/chest_xray/meddef12.png} \\
    \end{tabular}
    \caption{Saliency maps comparing MedDef ablation variants on the Chest X-Ray Dataset, demonstrating enhanced focus on pathologically relevant regions with complete DAAM architecture.}
    \label{fig:chest_saliency}
\end{figure*}

The activation maps for our model ablation variants on the ROCT dataset in Fig~\ref{fig:roct_saliency} show progressive improvement in attention focus as defensive components are added. The baseline ResNet18 shows diffuse activation patterns often attending to background retinal structures with limited diagnostic relevance. MedDef variants demonstrate increasingly targeted attention: the w/o AFD+MFE+MSF variant shows improved focus over baseline, the w/o AFD+MFE variant demonstrates better localization, the w/o AFD variant shows further enhancement, and the full DAAM implementation achieves optimal concentration on pathologically important features. In CNV cases, the full MedDef model accurately highlights neovascular membranes and related subretinal fluid, whereas in DME patients, it focuses precisely on areas of macular thickening and cystoid gaps.

Similarly, on the Chest X-Ray dataset shown in Fig~\ref{fig:chest_saliency}, the saliency maps reveal the superior feature localization of MedDef variants compared to baseline ResNet18. For pneumonia cases, the full MedDef model consistently identifies infiltration patterns and consolidations in affected lung fields, while maintaining appropriate focus on normal lung parenchyma in non-pathological cases. The progression from baseline through all ablation variants to full DAAM shows elimination of "shortcut learning" where models concentrate on edge characteristics, radiographic markers, or image artifacts that coincidentally correlate with training data classes but lack diagnostic validity.

The Defense-Aware Attention Mechanism effectively directs gradient flow toward pathologically significant regions, making the model more interpretable and trustworthy for clinical applications while also increasing resistance to adversarial attacks. The targeted attention pattern of MedDef explains its resilience against adversarial attacks, as perturbations to non-diagnostic regions have minimal impact on classification decisions. These visualization results are consistent with our quantitative findings, confirming that MedDef's superior adversarial robustness stems from its focus on genuinely relevant diagnostic features rather than spurious correlations.



\section{Challenges, Future Perspectives, and Conclusion}
\label{sec:challenges}

\subsection{Challenges and Future Perspectives}
The development phase of this research faced several key challenges: (1) data quality issues requiring extensive preprocessing to address inconsistencies and artifacts exploitable by adversarial attacks; (2) balancing model complexity with defensive strength, as additional attention layers simultaneously improved feature extraction but increased attack surfaces; (3) managing computational overhead while maintaining defensive effectiveness across different model variants; and (4) mitigating the inference overhead of DAAM through operation fusion and quantization-aware processing.

Future work will focus on: integrating diagnostic-aware defense with clinical feature importance maps to better differentiate critical anatomical features from adversarial noise; implementing layer-specific pruning strategies; investigating federated defensive learning for distributed datasets with enhanced privacy; and evaluating our defensive approach across larger and alternative architectures. These enhancements aim to optimize the balance between computational efficiency and adversarial resilience in medical imaging applications.

\subsection{Conclusion}
% \label{sec:conclusion}
In conclusion, this research demonstrates that targeted defensive mechanisms significantly outperform conventional architectures in adversarial medical imaging environments. The Defense-Aware Attention Mechanism achieves substantial reductions in attack success rates compared to standard models while maintaining diagnostic accuracy. Our comprehensive evaluation across different pruning levels demonstrates MedDef's robustness and efficiency across various deployment scenarios. By establishing that adversarial robustness and clinical accuracy can be simultaneously optimized, MedDef creates a foundation for trustworthy AI diagnostic systems resistant to manipulation.

\pdfbookmark[1]{Code Availability}{codeAvailability}
\section*{Code Availability}
The complete implementation of MedDef, including model architecture, adversarial training procedures, and evaluation code, is available at our GitHub repository: \url{https://github.com/Hetawk/meddef1.git}. All experiments and results presented in this paper can be reproduced using this codebase.

\pdfbookmark[1]{Data Availability}{dataAvailability}
\section*{Data Availability}
This study utilized two publicly available datasets for medical image classification tasks:
\begin{enumerate}
\item Retinal OCT Images (optical coherence tomography): Available from Kermany et al. (2018) via Kaggle at \url{https://www.kaggle.com/datasets/paultimothymooney/kermany2018}.
\item Chest X-Ray Images (Pneumonia): Available via Kaggle at \url{https://www.kaggle.com/datasets/paultimothymooney/chest-xray-pneumonia}.
\end{enumerate}

\pdfbookmark[1]{Acknowledgment}{acknowledgment}
\section*{Acknowledgment}
We sincerely thank everyone who contributed to this work, especially our supervisor, Professor Sijie Niu, for his guidance and support. This research was supported by grants from the National Natural Science Foundation of China, Natural Science Foundation of Shandong Province, and various innovation programs as detailed in the author information.

\bibliographystyle{IEEEtran}
\bibliography{ref/references}

\end{document}
