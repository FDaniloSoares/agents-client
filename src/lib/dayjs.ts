import lib from 'dayjs';
import 'dayjs/locale/en-GB'; // esse import executa autimaticamente o local para en-GB e agora pode ser usado com locale
// import 'dayjs/locale/pt-BR';
import relativeTime from 'dayjs/plugin/relativeTime';

lib.locale('en-GB');
lib.extend(relativeTime);

export const dayjs = lib;
