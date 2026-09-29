// [id do provedor, gênero, estilo (rótulo editorial nosso), descrição]
// Os ids são vozes neurais reais do Azure. Os estilos são rótulos aproximados: valide ouvindo.
const L = { 'pt-BR':['Português','Brasil'],'en-US':['Inglês','EUA'],'en-GB':['Inglês','Reino Unido'],'es-ES':['Espanhol','Espanha'],'es-MX':['Espanhol','México'],'fr-FR':['Francês','França'],'de-DE':['Alemão','Alemanha'],'it-IT':['Italiano','Itália'],'ja-JP':['Japonês','Japão'],'ko-KR':['Coreano','Coreia do Sul'] };
const raw = [
 ['pt-BR-FabioNeural','M','jovem','Masculina jovem, tom leve'],
 ['pt-BR-AntonioNeural','M','adulta','Masculina adulta, versátil'],
 ['pt-BR-DonatoNeural','M','grave','Masculina mais grave'],
 ['pt-BR-HumbertoNeural','M','jornalística','Masculina para notícias'],
 ['pt-BR-JulioNeural','M','documental','Masculina para narração documental'],
 ['pt-BR-ValerioNeural','M','institucional','Masculina institucional'],
 ['pt-BR-LeticiaNeural','F','jovem','Feminina jovem'],
 ['pt-BR-FranciscaNeural','F','adulta','Feminina adulta, versátil'],
 ['pt-BR-GiovannaNeural','F','suave','Feminina suave'],
 ['pt-BR-ElzaNeural','F','jornalística','Feminina para notícias'],
 ['pt-BR-LeilaNeural','F','documental','Feminina para narração documental'],
 ['pt-BR-ManuelaNeural','F','institucional','Feminina institucional'],
 ['en-US-GuyNeural','M','americana','Masculina americana'],
 ['en-US-JennyNeural','F','americana','Feminina americana'],
 ['en-GB-RyanNeural','M','britânica','Masculina britânica'],
 ['en-GB-SoniaNeural','F','britânica','Feminina britânica'],
 ['en-US-DavisNeural','M','documental','Voz documental'],
 ['en-US-AriaNeural','F','comercial','Voz comercial'],
 ['es-ES-AlvaroNeural','M','adulta','Masculina'],
 ['es-ES-ElviraNeural','F','adulta','Feminina'],
 ['es-MX-JorgeNeural','M','narrador','Narrador'],
 ['es-MX-DaliaNeural','F','comercial','Comercial'],
 ['fr-FR-HenriNeural','M','adulta','Masculina'],['fr-FR-DeniseNeural','F','adulta','Feminina'],
 ['de-DE-ConradNeural','M','adulta','Masculina'],['de-DE-KatjaNeural','F','adulta','Feminina'],
 ['it-IT-DiegoNeural','M','adulta','Masculina'],['it-IT-ElsaNeural','F','adulta','Feminina'],
 ['ja-JP-KeitaNeural','M','adulta','Masculina'],['ja-JP-NanamiNeural','F','adulta','Feminina'],
 ['ko-KR-InJoonNeural','M','adulta','Masculina'],['ko-KR-SunHiNeural','F','adulta','Feminina'],
];
export const VOICES = raw.map(([id,g,style,desc]) => { const loc = id.split('-').slice(0,2).join('-');
  return { id, name:id.split('-')[2].replace('Neural',''), gender:g==='M'?'Masculina':'Feminina', locale:loc, lang:L[loc][0], region:L[loc][1], style, desc }; });
