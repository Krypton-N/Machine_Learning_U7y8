import type { SlideDef } from "../deck/types";
import Portada from "./01-portada";
import Mapa from "./02-mapa";
import ComoSabemosSiSirve from "./03-como-sabemos-si-sirve";
import ArbolDeDecision from "./04-arbol-de-decision";
import ErrorEntrenamientoPrueba from "./05-error-entrenamiento-prueba";
import ArbolInestable from "./06-arbol-inestable";
import SesgoYVarianza from "./07-sesgo-y-varianza";
import SabiduriaDeMultitudes from "./08-sabiduria-de-multitudes";
import ParaleloOSecuencial from "./09-paralelo-o-secuencial";
import Bootstrap from "./10-bootstrap";
import Agregacion from "./11-agregacion";
import Oob from "./12-oob";
import BaggingNoBasta from "./13-bagging-no-basta";
import RandomForest from "./14-random-forest";
import ImportanciaDeVariables from "./15-importancia-de-variables";
import HiperparametrosRF from "./16-hiperparametros-rf";
import BoostingIntuicion from "./17-boosting-intuicion";
import AdaboostPesos from "./18-adaboost-pesos";
import AdaboostAlfa from "./19-adaboost-alfa";
import DescensoGradiente from "./20-descenso-gradiente";
import GradientBoosting from "./21-gradient-boosting";
import TasaDeAprendizaje from "./22-tasa-de-aprendizaje";
import XgboostRegularizacion from "./23-xgboost-regularizacion";
import XgboostSegundoOrden from "./24-xgboost-segundo-orden";
import LosCincoLadoALado from "./25-los-cinco-lado-a-lado";
import ComoSeComparan from "./26-como-se-comparan";
import DemoSieteModelos from "./27-demo-siete-modelos";
import CuandoUsarCadaUno from "./28-cuando-usar-cada-uno";
import ElOrdenImporta from "./29-el-orden-importa";
import ValidacionTemporal from "./30-validacion-temporal";
import QueEsUnaSerie from "./31-que-es-una-serie";
import TendenciaYEstacionalidad from "./32-tendencia-y-estacionalidad";
import CicloYRuido from "./33-ciclo-y-ruido";
import AditivaOMultiplicativa from "./34-aditiva-o-multiplicativa";
import Estacionariedad from "./35-estacionariedad";
import Diferenciar from "./36-diferenciar";
import PruebaADF from "./37-prueba-adf";
import PromedioMovil from "./38-promedio-movil";
import RezagosYACF from "./39-rezagos-y-acf";
import PACF from "./40-pacf";
import RuidoBlanco from "./41-ruido-blanco";
import AR from "./42-ar";
import MA from "./43-ma";
import ARMA from "./44-arma";
import ARIMA from "./45-arima";
import Identificacion from "./46-identificacion";
import SARIMA from "./47-sarima";
import ElegirYEvaluar from "./48-elegir-y-evaluar";
import LineaBase from "./49-linea-base";
import DemoSeries from "./50-demo-series";
import CausasOcultas from "./51-causas-ocultas";
import CadenaMarkov from "./52-cadena-markov";
import EstadosOcultos from "./53-estados-ocultos";
import Lambda from "./54-lambda";
import TresPreguntas from "./55-tres-preguntas";
import FuerzaBruta from "./56-fuerza-bruta";
import Forward from "./57-forward";
import TablaForward from "./58-tabla-forward";
import Viterbi from "./59-viterbi";
import ForwardVsViterbi from "./60-forward-vs-viterbi";
import PizarronPractica from "./61-pizarron-practica";
import RecetaTresCasos from "./62-receta-tres-casos";
import Referencias from "./63-referencias";

// Orden de la exposición. `num` es el número en la estructura completa (docs/PLAN-DIAPOSITIVAS.md).
export const slides: SlideDef[] = [
  { id: "portada", num: 1, steps: 1, Component: Portada },
  { id: "mapa", num: 2, steps: 4, Component: Mapa },
  { id: "como-sabemos-si-sirve", num: 3, steps: 10, Component: ComoSabemosSiSirve },
  { id: "arbol-de-decision", num: 4, steps: 6, Component: ArbolDeDecision },
  { id: "error-entrenamiento-prueba", num: 5, steps: 4, Component: ErrorEntrenamientoPrueba },
  { id: "arbol-inestable", num: 6, steps: 4, Component: ArbolInestable },
  { id: "sesgo-y-varianza", num: 7, steps: 5, Component: SesgoYVarianza },
  { id: "sabiduria-de-multitudes", num: 8, steps: 4, Component: SabiduriaDeMultitudes },
  { id: "paralelo-o-secuencial", num: 9, steps: 3, Component: ParaleloOSecuencial },
  { id: "bootstrap", num: 10, steps: 4, Component: Bootstrap },
  { id: "agregacion", num: 11, steps: 6, Component: Agregacion },
  { id: "oob", num: 12, steps: 5, Component: Oob },
  { id: "bagging-no-basta", num: 13, steps: 4, Component: BaggingNoBasta },
  { id: "random-forest", num: 14, steps: 6, Component: RandomForest },
  { id: "importancia-de-variables", num: 15, steps: 4, Component: ImportanciaDeVariables },
  { id: "hiperparametros-rf", num: 16, steps: 5, Component: HiperparametrosRF },
  { id: "boosting-intuicion", num: 17, steps: 5, Component: BoostingIntuicion },
  { id: "adaboost-pesos", num: 18, steps: 4, Component: AdaboostPesos },
  { id: "adaboost-alfa", num: 19, steps: 6, Component: AdaboostAlfa },
  { id: "descenso-gradiente", num: 20, steps: 5, Component: DescensoGradiente },
  { id: "gradient-boosting", num: 21, steps: 4, Component: GradientBoosting },
  { id: "tasa-de-aprendizaje", num: 22, steps: 3, Component: TasaDeAprendizaje },
  { id: "xgboost-regularizacion", num: 23, steps: 5, Component: XgboostRegularizacion },
  { id: "xgboost-segundo-orden", num: 24, steps: 7, Component: XgboostSegundoOrden },
  { id: "los-cinco-lado-a-lado", num: 25, steps: 9, Component: LosCincoLadoALado },
  { id: "como-se-comparan", num: 26, steps: 11, Component: ComoSeComparan },
  { id: "demo-siete-modelos", num: 27, steps: 10, Component: DemoSieteModelos },
  { id: "cuando-usar-cada-uno", num: 28, steps: 6, Component: CuandoUsarCadaUno },
  { id: "el-orden-importa", num: 29, steps: 7, Component: ElOrdenImporta },
  { id: "validacion-temporal", num: 30, steps: 8, Component: ValidacionTemporal },
  { id: "que-es-una-serie", num: 31, steps: 4, Component: QueEsUnaSerie },
  { id: "tendencia-y-estacionalidad", num: 32, steps: 4, Component: TendenciaYEstacionalidad },
  { id: "ciclo-y-ruido", num: 33, steps: 4, Component: CicloYRuido },
  { id: "aditiva-o-multiplicativa", num: 34, steps: 6, Component: AditivaOMultiplicativa },
  { id: "estacionariedad", num: 35, steps: 5, Component: Estacionariedad },
  { id: "diferenciar", num: 36, steps: 7, Component: Diferenciar },
  { id: "prueba-adf", num: 37, steps: 8, Component: PruebaADF },
  { id: "promedio-movil", num: 38, steps: 4, Component: PromedioMovil },
  { id: "rezagos-y-acf", num: 39, steps: 5, Component: RezagosYACF },
  { id: "pacf", num: 40, steps: 5, Component: PACF },
  { id: "ruido-blanco", num: 41, steps: 8, Component: RuidoBlanco },
  { id: "ar", num: 42, steps: 7, Component: AR },
  { id: "ma", num: 43, steps: 7, Component: MA },
  { id: "arma", num: 44, steps: 6, Component: ARMA },
  { id: "arima", num: 45, steps: 8, Component: ARIMA },
  { id: "identificacion", num: 46, steps: 7, Component: Identificacion },
  { id: "sarima", num: 47, steps: 10, Component: SARIMA },
  { id: "elegir-y-evaluar", num: 48, steps: 10, Component: ElegirYEvaluar },
  { id: "linea-base", num: 49, steps: 6, Component: LineaBase },
  { id: "demo-series", num: 50, steps: 9, Component: DemoSeries },
  { id: "causas-ocultas", num: 51, steps: 6, Component: CausasOcultas },
  { id: "cadena-markov", num: 52, steps: 7, Component: CadenaMarkov },
  { id: "estados-ocultos", num: 53, steps: 8, Component: EstadosOcultos },
  { id: "lambda", num: 54, steps: 7, Component: Lambda },
  { id: "tres-preguntas", num: 55, steps: 5, Component: TresPreguntas },
  { id: "fuerza-bruta", num: 56, steps: 8, Component: FuerzaBruta },
  { id: "forward", num: 57, steps: 8, Component: Forward },
  { id: "tabla-forward", num: 58, steps: 6, Component: TablaForward },
  { id: "viterbi", num: 59, steps: 7, Component: Viterbi },
  { id: "forward-vs-viterbi", num: 60, steps: 6, Component: ForwardVsViterbi },
  { id: "pizarron-practica", num: 61, steps: 14, Component: PizarronPractica },
  { id: "receta-tres-casos", num: 62, steps: 6, Component: RecetaTresCasos },
  { id: "referencias", num: 63, steps: 4, Component: Referencias },
];
