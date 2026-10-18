// Las fuentes de la exposición: el único lugar donde están escritas (la 63 solo las recorre).
// Antes de presentar, cada volumen, número y página se cotejó con la fuente (bitácora del hito 7).

export type Cita = { anio: string; autores: string; titulo: string; donde: string; diapositivas?: string };

export const PRINCIPALES: Cita[] = [
  { anio: "1996 · 2001", autores: "Breiman", titulo: "Bagging predictors · Random Forests", donde: "Machine Learning 24(2), 123–140 · 45(1), 5–32", diapositivas: "10–16" },
  { anio: "2009", autores: "Hastie, Tibshirani y Friedman", titulo: "The Elements of Statistical Learning, 2.ª ed.", donde: "Springer", diapositivas: "4–9, 17–22" },
  { anio: "2016", autores: "Chen y Guestrin", titulo: "XGBoost: A Scalable Tree Boosting System", donde: "KDD '16, 785–794", diapositivas: "23–24" },
  { anio: "2015", autores: "Box, Jenkins, Reinsel y Ljung", titulo: "Time Series Analysis: Forecasting and Control, 5.ª ed.", donde: "Wiley (1.ª ed. 1970)", diapositivas: "29–50" },
  { anio: "1989", autores: "Rabiner", titulo: "A Tutorial on Hidden Markov Models and Selected Applications in Speech Recognition", donde: "Proceedings of the IEEE 77(2), 257–286", diapositivas: "51–61" },
];

export const COMPLEMENTARIAS: { grupo: string; citas: Cita[] }[] = [
  {
    grupo: "Ensambles",
    citas: [
      { anio: "1984", autores: "Breiman, Friedman, Olshen y Stone", titulo: "Classification and Regression Trees", donde: "Wadsworth" },
      { anio: "1979", autores: "Efron", titulo: "Bootstrap methods: another look at the jackknife", donde: "Annals of Statistics 7(1), 1–26" },
      { anio: "1997", autores: "Freund y Schapire", titulo: "A decision-theoretic generalization of on-line learning and an application to boosting", donde: "J. Computer and System Sciences 55(1), 119–139" },
      { anio: "2000", autores: "Friedman, Hastie y Tibshirani", titulo: "Additive logistic regression: a statistical view of boosting", donde: "Annals of Statistics 28(2), 337–407" },
      { anio: "2001", autores: "Friedman", titulo: "Greedy function approximation: a gradient boosting machine", donde: "Annals of Statistics 29(5), 1189–1232" },
      { anio: "2009", autores: "Zhu, Zou, Rosset y Hastie", titulo: "Multi-class AdaBoost", donde: "Statistics and Its Interface 2(3), 349–360" },
    ],
  },
  {
    grupo: "Series de tiempo y datos",
    citas: [
      { anio: "1979", autores: "Dickey y Fuller", titulo: "Distribution of the estimators for autoregressive time series with a unit root", donde: "JASA 74(366), 427–431" },
      { anio: "1978", autores: "Ljung y Box", titulo: "On a measure of lack of fit in time series models", donde: "Biometrika 65(2), 297–303" },
      { anio: "1974", autores: "Akaike", titulo: "A new look at the statistical model identification", donde: "IEEE Trans. Automatic Control 19(6), 716–723" },
      { anio: "1978", autores: "Schwarz", titulo: "Estimating the dimension of a model", donde: "Annals of Statistics 6(2), 461–464" },
      { anio: "2021", autores: "Hyndman y Athanasopoulos", titulo: "Forecasting: Principles and Practice, 3.ª ed.", donde: "OTexts" },
      { anio: "1996", autores: "Becker y Kohavi", titulo: "Adult (Census Income)", donde: "UCI Machine Learning Repository, doi:10.24432/C5XW20" },
    ],
  },
  {
    grupo: "Modelos ocultos de Markov y software",
    citas: [
      { anio: "1967", autores: "Viterbi", titulo: "Error bounds for convolutional codes and an asymptotically optimum decoding algorithm", donde: "IEEE Trans. Information Theory 13(2), 260–269" },
      { anio: "1970", autores: "Baum, Petrie, Soules y Weiss", titulo: "A maximization technique occurring in the statistical analysis of probabilistic functions of Markov chains", donde: "Annals of Mathematical Statistics 41(1), 164–171" },
      { anio: "1977", autores: "Dempster, Laird y Rubin", titulo: "Maximum likelihood from incomplete data via the EM algorithm", donde: "JRSS B 39(1), 1–38" },
      { anio: "—", autores: "Wikipedia", titulo: "Hidden Markov model", donde: "el ejemplo del clima (π, A, B y caminar, comprar, limpiar)" },
      { anio: "2011", autores: "Pedregosa et al.", titulo: "Scikit-learn: Machine Learning in Python", donde: "JMLR 12, 2825–2830" },
      { anio: "2010", autores: "Seabold y Perktold", titulo: "statsmodels: econometric and statistical modeling with Python", donde: "Proc. 9th Python in Science Conference; y hmmlearn y XGBoost (documentación)" },
    ],
  },
];
