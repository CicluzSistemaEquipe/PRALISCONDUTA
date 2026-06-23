import type { Module, ModuleIconType, Story } from './types'

// ============================================================
// CONTEÚDO DOS MÓDULOS
// Texto fiel ao "Código de Ética e Conduta — Padaria Pralis"
// (Comercial Lisboa Alimentos Eireli — Juiz de Fora/MG, 09/03/2024)
// ============================================================

type RawModule = Omit<
  Module,
  'number' | 'gradient' | 'accent' | 'iconType' | 'tag' | 'subtitle' | 'kind'
> & { kind?: Module['kind'] }

const RAW_MODULES: RawModule[] = [
  // ---------------------------------------------------------
  // 1. BOAS-VINDAS / CÓDIGO DE CONDUTA
  // ---------------------------------------------------------
  {
    id: 'boas-vindas',
    title: 'Código de Conduta',
    icon: 'HeartHandshake',
    color: '#b8860b',
    estimatedMinutes: 3,
    mandatory: true,
    roles: 'all',
    section: 'geral',
    description: 'Por que ele existe e o que ele significa para você.',
    stories: [
      {
        type: 'lis',
        state: 'celebrating',
        videoSrc: '/lis-conduta1-alpha.webm',
        text: 'Oi! Eu sou a Lis. Antes de tudo, quero te apresentar algo muito importante: o nosso Código de Ética e Conduta. Ele é a base de tudo que a gente faz aqui, e entender ele é o seu primeiro passo em nossa empresa.',
      },
      {
        type: 'text',
        tag: 'O que é',
        title: 'Por que este Código existe?',
        audioSrc: '/audio-boas-vindas-codigo-existe.mp3',
        paragraphs: [
          'O Código de Ética e Conduta da Pralís existe para garantir que todos — colaboradores, clientes e fornecedores — sejam tratados com respeito, clareza e justiça.',
          'Ele define as regras de convivência, os deveres de cada colaborador e o que é terminantemente proibido dentro e fora da empresa. Não é uma burocracia: é a nossa cultura escrita.',
          'Todo colaborador tem a obrigação de conhecer e cumprir essas normas. O descumprimento pode gerar advertência, suspensão ou até demissão por justa causa.',
        ],
        highlights: ['respeito', 'clareza', 'cultura', 'obrigação'],
        highlight:
          'Se você tiver comprometimento, humildade e respeito, terá evolução e resultado!',
      },
      {
        type: 'text',
        tag: 'O que você vai assinar',
        title: 'Quatro documentos ao final',
        audioSrc: '/audio-boas-vindas-documentos.mp3',
        paragraphs: [
          'Ao concluir todos os módulos, você receberá para leitura e assinatura quatro documentos fundamentais.',
          'O Termo de Compromisso confirma que você conhece e aceita as normas da empresa. O Termo de Uso de Nome, Voz e Imagem regula como sua imagem pode ser usada pela Pralís.',
          'O Termo de Confidencialidade protege as informações internas — receitas, dados de clientes, senhas de sistemas. E o Termo de Não Aliciamento garante que você não vai desviar clientes, fornecedores ou colegas da empresa.',
        ],
        highlights: ['Compromisso', 'Confidencialidade', 'Não Aliciamento', 'assinatura'],
        highlight:
          'Leia cada termo com calma antes de assinar. Você só assina quando estiver pronto.',
      },
      {
        type: 'quiz',
        intro: {
          eyebrow: 'Hora de conferir',
          title: 'Vamos ver o que ficou claro?',
          description:
            'Você já viu a base do Código de Conduta. Agora a Lis vai te fazer perguntas rápidas para confirmar o entendimento, sem pegadinha: é só escolher a resposta que faz mais sentido.',
          voiceText:
            'Você já viu a base do Código de Conduta. Agora vamos fazer um questionário rápido para confirmar o que ficou claro. Não é uma prova difícil, é só uma checagem de entendimento. Leia com calma e escolha a resposta que faz mais sentido.',
          cta: 'Responder agora',
        },
        questions: [
          {
            id: 'bv-q1',
            prompt: 'Qual é a obrigação de todo colaborador em relação ao Código de Conduta?',
            options: [
              'Apenas assiná-lo no primeiro dia sem precisar ler',
              'Conhecer e cumprir com as suas normas',
              'Memorizar todas as páginas na íntegra',
              'Seguir somente as regras que se aplicam à sua função',
            ],
            correctIndex: 1,
            explain:
              'Exato! Todo colaborador tem a obrigação de conhecer e cumprir as normas — não basta assinar sem entender.',
          },
          {
            id: 'bv-q2',
            prompt: 'O que acontece se um colaborador descumprir o Código de Conduta?',
            options: [
              'Nada — o Código é apenas uma sugestão',
              'Apenas uma conversa informal com o gestor',
              'Pode receber advertência, suspensão ou demissão por justa causa',
              'Precisa refazer o treinamento e isso encerra o assunto',
            ],
            correctIndex: 2,
            explain:
              'Isso mesmo. As medidas disciplinares vão desde advertência verbal até demissão por justa causa, dependendo da gravidade.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Base Sólida',
        message: 'Você entendeu o propósito do nosso Código. Agora vamos ao que ele diz! 🌾',
      },
    ],
  },

  // ---------------------------------------------------------
  // 2. A JORNADA DO COLABORADOR
  // ---------------------------------------------------------
  {
    id: 'jornada-colaborador',
    title: 'A Jornada do Colaborador',
    icon: 'Route',
    color: '#f37435',
    estimatedMinutes: 3,
    mandatory: true,
    roles: 'all',
    section: 'geral',
    description: 'Do primeiro dia à efetivação: como funciona o caminho aqui.',
    stories: [
      {
        type: 'lis',
        state: 'talking',
        videoSrc: '/lis-jornada-alpha.webm',
        text: 'Agora, deixa eu te contar como funciona a sua jornada na Pralís, desde o primeiro dia até virar guardião da nossa cultura.',
      },
      {
        type: 'text',
        tag: 'O novo colaborador',
        title: 'Seu começo na Pralís',
        audioSrc: '/audio-jornada-seu-comeco.mp3',
        audioIncludesTitle: false,
        paragraphs: [
          'O novo colaborador é admitido pelo setor de Recursos Humanos com base na sua capacidade, habilidade e experiências prévias, conforme as necessidades de cada vaga.',
          'Ao ser escolhido, deve apresentar dentro do prazo toda a documentação exigida pelo RH.',
          'O colaborador cumprirá o período de experiência e, ao final, conforme a qualidade do serviço e as necessidades da empresa, poderá ser efetivado.',
        ],
        highlights: ['capacidade', 'habilidade', 'período de experiência'],
        highlight:
          'A observância às regras de conduta é essencial para que o colaborador em experiência possa ser efetivado.',
      },
      {
        type: 'text',
        tag: 'O colaborador efetivado',
        title: 'Guardião da cultura',
        audioSrc: '/audio-jornada-guardiao-cultura.mp3',
        audioIncludesTitle: false,
        paragraphs: [
          'Os colaboradores efetivados são guardiões da cultura e das normas da empresa, agindo em cumprimento ao Código como condição para bonificações e ascensão na carreira.',
          'Eles são designados para funções específicas, cumprindo tanto as normas gerais quanto aquelas exigidas pela sua função.',
          'As promoções são baseadas nos requisitos do cargo, nas habilidades, na qualidade do serviço e na antiguidade — sem qualquer discriminação.',
        ],
        highlights: ['guardiões', 'sem qualquer discriminação'],
      },
      {
        type: 'text',
        tag: 'O ex-colaborador',
        title: 'Mesmo depois, a parceria continua',
        audioSrc: '/audio-jornada-ex-colaborador.mp3',
        audioIncludesTitle: false,
        paragraphs: [
          'Quem encerra a jornada, por qualquer motivo, deve entregar a documentação exigida pelo RH dentro do prazo.',
          'É dever do ex-colaborador preservar o bom nome e a imagem comercial da empresa, sem emitir opiniões ou comentários públicos que firam a honra da empresa.',
          'Mesmo após a saída, continuam valendo os deveres de sigilo das informações confidenciais e de não aliciamento de clientes, fornecedores, parceiros e colegas.',
        ],
        highlights: ['sigilo', 'não aliciamento'],
      },
      {
        type: 'summary',
        title: 'O que vimos até aqui',
        bullets: [
          'A admissão considera capacidade, habilidade e experiência.',
          'O período de experiência avalia a qualidade do seu serviço.',
          'Cumprir as regras de conduta é essencial para a efetivação.',
          'Promoções valorizam mérito e antiguidade, sem discriminação.',
          'Sigilo e não aliciamento valem até depois da saída.',
        ],
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'jc-q1',
            prompt: 'O que é essencial para que o colaborador em experiência seja efetivado?',
            options: [
              'Trabalhar horas extras todos os dias',
              'A observância às regras de conduta',
              'Ter parentes na empresa',
              'Nunca tirar férias',
            ],
            correctIndex: 1,
            explain: 'Exato! A observância às regras de conduta é considerada essencial para a efetivação.',
          },
          {
            id: 'jc-q2',
            prompt: 'Depois de sair da empresa, o ex-colaborador ainda deve...',
            options: [
              'Devolver o uniforme apenas',
              'Preservar o sigilo e não aliciar clientes e colegas',
              'Não tem mais nenhum dever',
              'Continuar batendo ponto',
            ],
            correctIndex: 1,
            explain:
              'Isso mesmo! Os deveres de sigilo e de não aliciamento continuam valendo após o fim da jornada.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Conhece a Jornada',
        message: 'Agora você entende o caminho do colaborador na Pralís! 🚀',
      },
    ],
  },

  // ---------------------------------------------------------
  // 3. O QUE É DEVER?
  // ---------------------------------------------------------
  {
    id: 'deveres',
    title: 'O que é Dever?',
    icon: 'ClipboardCheck',
    color: '#b8860b',
    estimatedMinutes: 4,
    mandatory: true,
    roles: 'all',
    section: 'geral',
    description: 'Os deveres de todos os colaboradores da Pralís.',
    stories: [
      {
        type: 'lis',
        state: 'talking',
        videoSrc: '/lis-deverdetodos.webm',
        text: 'Agora vamos falar sobre os deveres que valem para TODO mundo aqui na Pralís. São o nosso combinado do dia a dia.',
      },
      {
        type: 'text',
        tag: 'Pontualidade & uniforme',
        title: 'É dever de todos',
        audioSrc: '/audio-deveres-pontualidade-uniforme.mp3',
        audioIncludesTitle: false,
        paragraphs: [
          'Cumprir a pontualidade na entrada e na saída, registrando o ponto corretamente. Faltar apenas com aviso prévio e justificativa válida, entregando o atestado no exato dia do retorno, na primeira hora.',
          'Cuidar do uniforme e do crachá fornecidos e informar manchas ou rasgos. Comparecer de uniforme, com calça longa, sapato fechado, cabelos presos, sem barba, unhas aparadas com esmalte nude e maquiagem discreta.',
          'Exceto os gerentes, o uniforme deve ser usado apenas nas dependências da empresa — não durante o trajeto, por normas sanitárias.',
        ],
        highlights: ['pontualidade', 'uniforme', 'atestado', 'normas sanitárias'],
      },
      {
        type: 'text',
        tag: 'Segurança & cuidado',
        title: 'Cuidado com pessoas e utensílios',
        paragraphs: [
          'Respeitar as regras de segurança para manusear produtos quentes e utensílios cortantes, comunicando ao supervisor caso veja alguém agindo de forma insegura.',
          'Usar os utensílios da empresa com cuidado e somente para o trabalho, sem retirá-los sem autorização. O uso descuidado pode gerar desconto dos prejuízos no salário.',
          'Autorizar a revista de pertences ao final do expediente, feita na forma da Lei pelo gerente responsável.',
        ],
        highlights: ['segurança', 'cuidado', 'autorização'],
        highlight:
          'Viu alguém agindo de maneira insegura? Comunique ao supervisor. Segurança é dever de todos.',
      },
      {
        type: 'text',
        tag: 'Cliente & qualidade',
        title: 'O cliente em primeiro lugar',
        paragraphs: [
          'Tratar os clientes com máximo respeito e cordialidade, com atendimento rápido e eficiente. Sem o produto que o cliente busca, oferecer alternativas. Contato apenas pelos meios oficiais da empresa.',
          'Trabalhar para que a qualidade dos alimentos seja máxima — do preparo até servir ao cliente — com atenção a temperatura, limpeza, sabor, visual, beleza e frescor.',
          'Não conceder favores, descontos ou condições especiais a clientes sem autorização. Não permitir que terceiros acessem áreas restritas sem autorização.',
        ],
        highlights: ['respeito', 'cordialidade', 'qualidade', 'frescor'],
      },
      {
        type: 'text',
        tag: 'Convivência & responsabilidade',
        title: 'Um ambiente sem fofocas',
        paragraphs: [
          'Entregar de imediato qualquer correspondência recebida em nome da empresa. Se exigir assinatura de recebimento, chamar o gerente.',
          'Toda criação de produtos e receitas a serviço da empresa é de propriedade intelectual da empresa.',
          'Manter o ambiente de trabalho organizado é dever de todos, mesmo sem ser o responsável pela limpeza. Quando solicitado pelo gestor, cumprir funções atípicas com boa vontade e agilidade — inclusive funções externas.',
          'Descumprimentos ou desconfortos com colegas devem ser informados diretamente ao superior hierárquico, não a outros colaboradores, para evitar fofocas.',
        ],
        highlights: ['propriedade intelectual', 'boa vontade', 'superior hierárquico'],
        highlight:
          'Problemas se resolvem com o superior hierárquico — nunca alimentando a fofoca.',
      },
      {
        type: 'summary',
        title: 'Seus deveres, em resumo',
        bullets: [
          'Pontualidade e ponto registrado corretamente.',
          'Uniforme cuidado e usado só nas dependências da empresa.',
          'Segurança no manuseio e cuidado com os utensílios.',
          'Cliente tratado com respeito, agilidade e pelos canais oficiais.',
          'Conflitos resolvidos com o superior, sem fofoca.',
        ],
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'dv-q1',
            prompt: 'Quando você presencia um colega agindo de maneira insegura, o que deve fazer?',
            options: [
              'Ignorar, não é problema seu',
              'Comentar com outros colegas',
              'Comunicar ao supervisor',
              'Gravar um vídeo',
            ],
            correctIndex: 2,
            explain: 'Certíssimo! Situações inseguras devem ser comunicadas ao supervisor.',
          },
          {
            id: 'dv-q2',
            prompt: 'Um desconforto com um colega de trabalho deve ser levado a quem?',
            options: [
              'A todos os colegas do setor',
              'Diretamente ao superior hierárquico',
              'Às redes sociais',
              'Ninguém, melhor guardar',
            ],
            correctIndex: 1,
            explain:
              'Isso! Falamos direto com o superior hierárquico — assim evitamos um ambiente de fofocas.',
          },
          {
            id: 'dv-q3',
            prompt: 'O uniforme da Pralís, salvo os gerentes, deve ser usado...',
            options: [
              'Em qualquer lugar, inclusive no trajeto',
              'Apenas nas dependências da empresa',
              'Somente em dias de evento',
              'Por cima de roupas pessoais',
            ],
            correctIndex: 1,
            explain:
              'Exato! Por normas sanitárias, o uniforme fica restrito às dependências da empresa.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Mestre dos Deveres',
        message: 'Você dominou os deveres de todo colaborador Pralís! ✅',
      },
    ],
  },

  // ---------------------------------------------------------
  // 4. O QUE É PROIBIDO?
  // ---------------------------------------------------------
  {
    id: 'proibido',
    title: 'O que é Proibido?',
    icon: 'Ban',
    color: '#dc3545',
    estimatedMinutes: 4,
    mandatory: true,
    roles: 'all',
    section: 'geral',
    description: 'As condutas terminantemente proibidas na empresa.',
    stories: [
      {
        type: 'lis',
        state: 'alert',
        videoSrc: '/lis-proibido.webm',
        text: 'Agora preciso da sua atenção TOTAL. Estas são as condutas terminantemente proibidas na Pralís, e o descumprimento tem consequências sérias.',
      },
      {
        type: 'text',
        tag: 'Respeito acima de tudo',
        title: 'Zero tolerância',
        paragraphs: [
          'É terminantemente proibida qualquer conduta de discriminação, assédio, desrespeito, exploração e preconceito de qualquer natureza — raça, religião, faixa etária, sexo, convicção política, nacionalidade, estado civil, orientação sexual ou qualquer outra.',
          'Também é proibido qualquer comportamento abusivo que induza à intimidação ou ao constrangimento.',
        ],
        highlights: ['discriminação', 'assédio', 'preconceito', 'proibida'],
        highlight: 'Respeito não é negociável. Nenhuma forma de discriminação é tolerada.',
      },
      {
        type: 'text',
        tag: 'Imagem & voz da empresa',
        title: 'Quem fala pela Pralís',
        paragraphs: [
          'É proibido emitir qualquer comentário ou opinião em nome da empresa sem autorização — seja de forma particular, em entrevistas, palestras ou redes sociais.',
          'É proibido usar o nome, a logo e a marca da empresa sem autorização prévia, falar com a imprensa em nome da empresa ou criar páginas e perfis em redes sociais sem autorização.',
        ],
        highlights: ['sem autorização', 'imprensa', 'redes sociais'],
      },
      {
        type: 'text',
        tag: 'Bens, sigilo & multa',
        title: 'Cuidado: aqui há multa',
        paragraphs: [
          'É proibida a apropriação de bens da empresa — utensílios, valores ou perecíveis — sem autorização prévia do gestor, e qualquer desperdício de alimentos e insumos no preparo.',
          'É proibida a divulgação de informações confidenciais: planos de negócio, dados de clientes, fornecedores e colaboradores, receitas exclusivas e senhas dos sistemas internos.',
          'Também é proibido aliciar clientes, fornecedores, parceiros ou colegas a mudarem sua relação com a empresa, em benefício próprio, de terceiros ou de concorrentes.',
        ],
        highlights: ['confidenciais', 'receitas exclusivas', 'aliciar'],
        highlight:
          'Divulgar informação confidencial ou aliciar: multa de DEZ salários mínimos por cada documento ou informação.',
      },
      {
        type: 'text',
        tag: 'No expediente',
        title: 'Durante o trabalho, é proibido',
        paragraphs: [
          'Fazer propaganda política nas dependências da empresa e fora dela enquanto uniformizado. A empresa atende todos os públicos.',
          'Fumar enquanto estiver de uniforme, mesmo em intervalos. Usar fones de ouvido durante o expediente. Usar o celular pessoal durante o expediente (exceto gerentes) — ele deve ficar guardado na bolsa ou no armário.',
          'Trabalhar sob influência de drogas ou álcool, ou portando arma de fogo. Acessar o armário de outro funcionário, ainda que com autorização dele. Trocar de função com outro colega sem autorização do gestor. Faltar sem aviso prévio e sem justo motivo.',
        ],
        highlights: ['política', 'celular pessoal', 'drogas ou álcool', 'arma de fogo'],
      },
      {
        type: 'text',
        tag: 'Situação com o cliente',
        title: 'Se suspeitar que um cliente saiu sem pagar',
        paragraphs: [
          'Informe imediatamente ao gestor se houver suspeita de que o cliente saiu sem pagar ou esqueceu algo no local.',
          'Você NÃO deve abordar o cliente nem impedir a sua saída. Quem conduz a situação é o gestor.',
        ],
        highlights: ['informe ao gestor', 'não deve abordar'],
        highlight: 'Nunca aborde ou impeça a saída do cliente. Avise o gestor — sempre.',
      },
      {
        type: 'summary',
        title: 'O que é proibido, em resumo',
        bullets: [
          'Qualquer discriminação, assédio ou preconceito.',
          'Falar em nome da empresa sem autorização.',
          'Vazar informações confidenciais ou aliciar (multa de 10 salários).',
          'Celular pessoal, fones, fumar de uniforme e política no expediente.',
          'Abordar cliente suspeito — avise o gestor, não aja sozinho.',
        ],
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'pr-q1',
            prompt: 'Qual a penalidade por divulgar informações confidenciais ou aliciar clientes/colegas?',
            options: [
              'Apenas advertência verbal',
              'Multa de dez salários mínimos',
              'Um dia de suspensão',
              'Nenhuma',
            ],
            correctIndex: 1,
            explain:
              'Isso! A multa é de dez salários mínimos por cada documento ou informação — leve muito a sério.',
          },
          {
            id: 'pr-q2',
            prompt: 'Você suspeita que um cliente saiu sem pagar. O que fazer?',
            options: [
              'Correr atrás e impedir a saída',
              'Abordar o cliente educadamente',
              'Informar imediatamente ao gestor, sem abordar o cliente',
              'Chamar os outros clientes para ajudar',
            ],
            correctIndex: 2,
            explain:
              'Perfeito! Avise o gestor de imediato e não aborde nem impeça a saída do cliente.',
          },
          {
            id: 'pr-q3',
            prompt: 'Sobre o celular pessoal durante o expediente (exceto gerentes):',
            options: [
              'Pode usar à vontade',
              'Pode usar só para fotos',
              'Deve ficar guardado na bolsa ou armário',
              'Pode usar com fones',
            ],
            correctIndex: 2,
            explain:
              'Correto! O celular pessoal fica guardado na bolsa ou no armário durante o expediente.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Conduta Impecável',
        message: 'Você sabe exatamente onde estão os limites. Respeito é a base! 🛡️',
      },
    ],
  },

  // ---------------------------------------------------------
  // 5. PREPARO DOS ALIMENTOS (cargo)
  // ---------------------------------------------------------
  {
    id: 'preparo-alimentos',
    title: 'Preparo dos Alimentos',
    icon: 'ChefHat',
    color: '#f37435',
    estimatedMinutes: 3,
    mandatory: false,
    roles: ['Preparo de alimentos'],
    section: 'cargo',
    description: 'Normas para quem trabalha diretamente no preparo.',
    stories: [
      {
        type: 'lis',
        state: 'talking',
        text: 'Esse módulo é especial pra você que põe a mão na massa! Segurança e higiene são tudo no preparo. 👩‍🍳',
      },
      {
        type: 'text',
        tag: 'Higiene & segurança',
        title: 'Quem prepara, protege',
        paragraphs: [
          'É dever de quem trabalha diretamente no preparo conhecer as normas de segurança do trabalho e da vigilância sanitária.',
          'Usar uniforme em perfeito estado de conservação e limpeza, e manter o ambiente limpo e organizado. Usar e limpar os equipamentos fornecidos, sem joias ou acessórios.',
          'Não ter barba, manter as unhas cortadas e sem esmalte nos dias de expediente.',
        ],
        highlights: ['vigilância sanitária', 'sem joias', 'unhas cortadas'],
      },
      {
        type: 'text',
        tag: 'Receitas & equipamentos',
        title: 'Precisão evita desperdício',
        paragraphs: [
          'É dever conhecer as medidas e receitas dos preparos, evitando desperdícios e respeitando os horários predefinidos pela gestão.',
          'Conhecer o manuseio de todos os equipamentos envolvidos no preparo, usar os equipamentos de segurança e evitar peças de roupa com tecidos inflamáveis.',
        ],
        highlights: ['medidas', 'receitas', 'inflamáveis'],
        highlight: 'Tecidos inflamáveis perto do fogo, jamais. Equipamento de segurança, sempre.',
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'pa-q1',
            prompt: 'No preparo dos alimentos, é correto:',
            options: [
              'Usar anéis e pulseiras finas',
              'Trabalhar sem joias, com unhas cortadas e sem esmalte',
              'Manter barba bem aparada',
              'Usar roupas de tecido inflamável se forem confortáveis',
            ],
            correctIndex: 1,
            explain:
              'Isso! Nada de joias, unhas cortadas e sem esmalte — higiene e segurança em primeiro lugar.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Mãos na Massa',
        message: 'Pronto pra preparar com segurança e capricho! 🍞',
      },
    ],
  },

  // ---------------------------------------------------------
  // 6. ATENDIMENTO AO CLIENTE (cargo)
  // ---------------------------------------------------------
  {
    id: 'atendimento-cliente',
    title: 'Atendimento ao Cliente',
    icon: 'Users',
    color: '#b8860b',
    estimatedMinutes: 3,
    mandatory: false,
    roles: ['Atendimento ao cliente'],
    section: 'cargo',
    description: 'Para quem está em contato direto com o cliente.',
    stories: [
      {
        type: 'lis',
        state: 'celebrating',
        text: 'Você é a cara da Pralís pro cliente! Bom humor e acolhimento fazem toda a diferença. 😊',
      },
      {
        type: 'text',
        tag: 'Apresentação',
        title: 'Em contato direto com o cliente',
        paragraphs: [
          'Estar com uniforme em perfeito estado de conservação e limpeza, mantendo o ambiente de trabalho limpo e organizado.',
          'Estar sem barba, com unhas curtas e esmalte claro, pouca bijuteria (apenas brinco discreto e aliança), por se tratar de ambiente de consumo de alimentos.',
        ],
        highlights: ['uniforme', 'esmalte claro', 'brinco discreto'],
      },
      {
        type: 'text',
        tag: 'Postura no atendimento',
        title: 'Sempre de bom humor',
        paragraphs: [
          'O contato com o cliente deve ser sempre de bom humor, com respeito e acolhimento, e feito pelos meios oficiais da empresa (exceto gerentes).',
          'O atendimento acontece no balcão ou nas mesas, conforme onde o cliente estiver, com máxima agilidade e eficiência.',
          'Não usar fones de ouvido ou celular pessoal, salvo situações excepcionais, pela atenção que o cliente exige.',
        ],
        highlights: ['bom humor', 'acolhimento', 'agilidade'],
        highlight: 'Bom humor, respeito e acolhimento: a receita do atendimento Pralís.',
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'ac-q1',
            prompt: 'Como deve ser o contato com o cliente na Pralís?',
            options: [
              'Rápido, mesmo que sem simpatia',
              'Sempre de bom humor, com respeito e acolhimento',
              'Apenas por aplicativos pessoais',
              'Somente quando o cliente reclama',
            ],
            correctIndex: 1,
            explain: 'Exato! Bom humor, respeito e acolhimento — sempre, e pelos canais oficiais.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Sorriso Pralís',
        message: 'Você encanta cada cliente que chega! ✨',
      },
    ],
  },

  // ---------------------------------------------------------
  // 7. CAIXA (cargo)
  // ---------------------------------------------------------
  {
    id: 'caixa',
    title: 'Colaboradores do Caixa',
    icon: 'CreditCard',
    color: '#5dd87a',
    estimatedMinutes: 2,
    mandatory: false,
    roles: ['Caixa'],
    section: 'cargo',
    description: 'Segurança e agilidade no ponto mais sensível da loja.',
    stories: [
      {
        type: 'lis',
        state: 'alert',
        text: 'O caixa é um ponto sensível: atenção redobrada com segurança e com o procedimento financeiro!',
      },
      {
        type: 'text',
        tag: 'Segurança do caixa',
        title: 'Atenção e organização',
        paragraphs: [
          'Manter-se atento às formas de pagamento e à segurança do caixa, mantendo-o sempre fechado quando não estiver em uso.',
          'Prezar por um atendimento ágil no pagamento. Quando formar fila, organizá-la para não atrapalhar a passagem de clientes que estão entrando.',
        ],
        highlights: ['segurança', 'sempre fechado', 'fila'],
      },
      {
        type: 'text',
        tag: 'Regra de ouro',
        title: 'Nunca retire valores sem autorização',
        paragraphs: [
          'É terminantemente proibido retirar valores do caixa sem autorização dos gestores — ainda que a pedido de outros colaboradores.',
          'Seguir estritamente o procedimento financeiro de registro do caixa elaborado pelos gestores.',
        ],
        highlights: ['terminantemente proibido', 'sem autorização'],
        highlight: 'Retirar valor do caixa sem autorização do gestor: jamais, por ninguém.',
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'cx-q1',
            prompt: 'Um colega pede para você retirar um valor do caixa. O que fazer?',
            options: [
              'Retirar, pois foi um colega que pediu',
              'Retirar só se for pouco',
              'Não retirar — é proibido sem autorização dos gestores',
              'Retirar e anotar num papel',
            ],
            correctIndex: 2,
            explain:
              'Correto! É terminantemente proibido retirar valores sem autorização dos gestores, mesmo a pedido de colegas.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Caixa Seguro',
        message: 'Você protege o coração financeiro da loja! 💳',
      },
    ],
  },

  // ---------------------------------------------------------
  // 8. LIMPEZA (cargo)
  // ---------------------------------------------------------
  {
    id: 'limpeza',
    title: 'Colaboradores da Limpeza',
    icon: 'Sparkles',
    color: '#d4a86a',
    estimatedMinutes: 2,
    mandatory: false,
    roles: ['Limpeza'],
    section: 'cargo',
    description: 'Higiene é a base de tudo num ambiente de alimentos.',
    stories: [
      {
        type: 'lis',
        state: 'talking',
        text: 'Sua função é a base de tudo! Sem higiene, não existe alimento seguro. 🧼',
      },
      {
        type: 'text',
        tag: 'Higiene contínua',
        title: 'Limpo o dia inteiro',
        paragraphs: [
          'É dever manter o ambiente limpo e organizado durante todo o expediente, ciente das normas de vigilância sanitária para estabelecimentos que manuseiam alimentos.',
          'Acompanhar a entrada e saída dos clientes para manter a limpeza ao longo do dia. A limpeza que atrapalhe a circulação ou gere risco de acidentes deve ser feita fora dos horários de pico.',
        ],
        highlights: ['vigilância sanitária', 'fora dos horários de pico'],
      },
      {
        type: 'text',
        tag: 'Produtos & EPIs',
        title: 'Produto certo, com segurança',
        paragraphs: [
          'Usar corretamente os produtos de limpeza para cada tipo de material e superfície, evitando danificar utensílios e causar riscos aos alimentos.',
          'Ter ciência de que certos produtos são inflamáveis e usá-los com segurança. Utilizar os Equipamentos de Proteção Individual (EPIs) fornecidos pela empresa a todo tempo.',
        ],
        highlights: ['produto certo', 'inflamáveis', 'EPIs'],
        highlight: 'EPIs fornecidos pela empresa: use a todo tempo, sem exceção.',
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'lp-q1',
            prompt: 'A limpeza que pode atrapalhar a circulação ou causar acidentes deve ser feita:',
            options: [
              'No horário de maior movimento',
              'Fora dos horários de pico comercial',
              'Só no fim do expediente',
              'Apenas quando alguém reclama',
            ],
            correctIndex: 1,
            explain: 'Isso! Esse tipo de limpeza é feito fora dos horários de pico, por segurança.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Brilho Pralís',
        message: 'Você mantém a Pralís impecável e segura! ✨',
      },
    ],
  },

  // ---------------------------------------------------------
  // 9. FUNÇÃO EXTERNA (cargo)
  // ---------------------------------------------------------
  {
    id: 'funcao-externa',
    title: 'Função Externa',
    icon: 'MapPin',
    color: '#f37435',
    estimatedMinutes: 3,
    mandatory: false,
    roles: ['Função externa'],
    section: 'cargo',
    description: 'Representando a Pralís em eventos e fora da loja.',
    stories: [
      {
        type: 'lis',
        state: 'talking',
        text: 'Fora da loja, você É a Pralís. Toda a postura do Código vale — e com responsabilidade extra! 📍',
      },
      {
        type: 'text',
        tag: 'Postura externa',
        title: 'A Pralís onde você estiver',
        paragraphs: [
          'Agir no estrito cumprimento do Código de Normas, com uniforme em perfeito estado, sem barba, unhas aparadas, pouca maquiagem, perfume e joias.',
          'Chegar ao evento com pontualidade e não permanecer além do tempo contratado sem autorização expressa do gestor.',
        ],
        highlights: ['estrito cumprimento', 'pontualidade'],
      },
      {
        type: 'text',
        tag: 'Limites & responsabilidade',
        title: 'O que você pode e não pode',
        paragraphs: [
          'A contabilização e o inventário dos utensílios são de responsabilidade do colaborador.',
          'Não realizar acordos ou ajustes com clientes sem autorização prévia, nem receber valores ou cobrar taxas diretamente.',
          'Não assumir funções no evento além das indicadas pelo gestor, e não ceder a imagem para publicações como representante da empresa sem autorização.',
        ],
        highlights: ['inventário', 'sem autorização', 'imagem'],
        highlight: 'Nada de acordos, valores ou taxas com o cliente por conta própria.',
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'fe-q1',
            prompt: 'Em uma função externa, sobre acordos e valores com o cliente:',
            options: [
              'Pode negociar e receber à vontade',
              'Pode receber, mas não negociar',
              'Não pode fazer acordos nem receber valores sem autorização prévia',
              'Só pode cobrar taxas pequenas',
            ],
            correctIndex: 2,
            explain:
              'Exato! Sem autorização prévia, nada de acordos, recebimento de valores ou cobrança de taxas.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Embaixador Pralís',
        message: 'Você leva a Pralís com responsabilidade aonde for! 🌍',
      },
    ],
  },

  // ---------------------------------------------------------
  // 10. FORNECEDORES & SOCIEDADE
  // ---------------------------------------------------------
  {
    id: 'fornecedores-sociedade',
    title: 'Fornecedores & Sociedade',
    icon: 'Handshake',
    color: '#b8860b',
    estimatedMinutes: 3,
    mandatory: true,
    roles: 'all',
    section: 'final',
    description: 'Como a Pralís se relaciona com parceiros e com o mundo.',
    stories: [
      {
        type: 'lis',
        state: 'talking',
        text: 'A Pralís também tem compromissos para fora: com fornecedores e com a sociedade. Bora ver?',
      },
      {
        type: 'text',
        tag: 'Fornecedores',
        title: 'Parcerias com qualidade e boa-fé',
        paragraphs: [
          'A empresa seleciona fornecedores que asseguram a qualidade dos produtos e serviços, considerando histórico no mercado, condições de preço, pagamento, prazos e entregas.',
          'A empresa pode recusar ou encerrar parceria com fornecedores envolvidos em escândalos que prejudiquem sua imagem comercial.',
          'A empresa rejeita qualquer prática que restrinja o comércio ou a livre concorrência, comprometida com a boa-fé comercial e a legislação do mercado.',
        ],
        highlights: ['qualidade', 'boa-fé', 'livre concorrência'],
      },
      {
        type: 'text',
        tag: 'Sociedade',
        title: 'Respeito às pessoas e ao planeta',
        paragraphs: [
          'A empresa preza pelo respeito à legislação trabalhista, ao Direito do Consumidor e às normas de proteção de dados em toda a sua atuação.',
          'Trabalha em observância às normativas técnicas e de segurança dos alimentos, cumprindo recomendações da Vigilância Sanitária e dos órgãos competentes.',
          'Cuida do meio ambiente e dos produtos que utiliza, evitando desperdícios e atitudes não sustentáveis.',
        ],
        highlights: ['proteção de dados', 'Vigilância Sanitária', 'meio ambiente'],
        highlight: 'Respeito às pessoas, às leis e ao planeta faz parte do jeito Pralís.',
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'fs-q1',
            prompt: 'A empresa pode encerrar parceria com um fornecedor quando ele:',
            options: [
              'Aumenta um pouco o preço',
              'Se envolve em escândalos que prejudicam a imagem comercial',
              'Atrasa uma entrega por chuva',
              'Tem poucos funcionários',
            ],
            correctIndex: 1,
            explain:
              'Isso! A Pralís se resguarda o direito de encerrar parcerias com fornecedores envolvidos em escândalos.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Visão Ampla',
        message: 'Você entende o compromisso da Pralís com o mundo! 🤝',
      },
    ],
  },

  // ---------------------------------------------------------
  // 11. DAS PENALIDADES
  // ---------------------------------------------------------
  {
    id: 'penalidades',
    title: 'Das Penalidades',
    icon: 'AlertTriangle',
    color: '#dc3545',
    estimatedMinutes: 2,
    mandatory: true,
    roles: 'all',
    section: 'final',
    description: 'O que acontece quando o Código é violado.',
    stories: [
      {
        type: 'lis',
        state: 'alert',
        text: 'Pra fechar, é importante saber: o que acontece se o Código for descumprido?',
      },
      {
        type: 'text',
        tag: 'Medidas disciplinares',
        title: 'Quando o Código é violado',
        paragraphs: [
          'Medidas disciplinares são aplicadas em casos de violação do Código de Ética e Conduta. Ao adotá-las, consideram-se a gravidade do fato e outras circunstâncias relevantes.',
          'As medidas podem ser: advertência verbal ou por escrito, suspensão, e demissão por justa causa.',
          'Além das multas já previstas no documento, outras medidas podem ser aplicadas em conjunto, conforme a conduta do colaborador.',
        ],
        highlights: ['advertência', 'suspensão', 'demissão por justa causa'],
        highlight:
          'Gravidade e circunstâncias contam: da advertência verbal à demissão por justa causa.',
      },
      {
        type: 'summary',
        title: 'As medidas, em ordem de gravidade',
        bullets: [
          'Advertência verbal ou por escrito.',
          'Suspensão.',
          'Demissão por justa causa.',
          'Multas previstas no Código, somadas a outras medidas.',
        ],
      },
      {
        type: 'quiz',
        questions: [
          {
            id: 'pe-q1',
            prompt: 'Quais fatores são considerados ao aplicar uma medida disciplinar?',
            options: [
              'O tempo de casa apenas',
              'A gravidade do fato e outras circunstâncias relevantes',
              'A opinião dos colegas',
              'Nada, a medida é sempre a mesma',
            ],
            correctIndex: 1,
            explain:
              'Correto! Consideram-se a gravidade do fato e as circunstâncias relevantes de cada caso.',
          },
        ],
      },
      {
        type: 'completion',
        badge: 'Ciente das Regras',
        message: 'Você concluiu todos os módulos! Falta só a assinatura. ✍️',
      },
    ],
  },

  // ---------------------------------------------------------
  // 12. COMPROMISSO & ASSINATURA
  // ---------------------------------------------------------
  {
    id: 'assinatura',
    title: 'Compromisso & Assinatura',
    icon: 'FileSignature',
    color: '#5dd87a',
    estimatedMinutes: 3,
    mandatory: true,
    roles: 'all',
    section: 'final',
    kind: 'signature',
    description: 'Você faz parte da família. Assine e conclua.',
    stories: [
      {
        type: 'lis',
        state: 'celebrating',
        text: 'Chegamos ao fim! Agora é só formalizar o seu compromisso com a família Pralís. 🌾',
      },
    ],
  },
]

// ============================================================
// Metadados visuais por módulo (estilo rede social)
// ============================================================

const MODULE_META: Record<
  string,
  { number: string; gradient: [string, string]; accent: string; iconType: ModuleIconType; tag: string; subtitle: string }
> = {
  'boas-vindas': { number: '01', gradient: ['#b8860b', '#7a5a08'], accent: '#b8860b', iconType: 'flower', tag: 'FUNDAMENTOS', subtitle: 'Conheça a Pralís' },
  'jornada-colaborador': { number: '02', gradient: ['#f37435', '#b84f1a'], accent: '#f37435', iconType: 'sprout', tag: 'CARREIRA', subtitle: 'Seu caminho aqui' },
  deveres: { number: '03', gradient: ['#c8900a', '#8a6005'], accent: '#c8900a', iconType: 'wheat', tag: 'OBRIGAÇÕES', subtitle: 'O que esperamos de você' },
  proibido: { number: '04', gradient: ['#a93226', '#6b1e18'], accent: '#c0392b', iconType: 'grain', tag: 'LIMITES', subtitle: 'Limites e respeito' },
  'preparo-alimentos': { number: '05', gradient: ['#d4690d', '#8f4008'], accent: '#e67e22', iconType: 'sprout', tag: 'PRODUÇÃO', subtitle: 'Arte e cuidado' },
  'atendimento-cliente': { number: '06', gradient: ['#e87320', '#9c4510'], accent: '#f37435', iconType: 'flower', tag: 'RELACIONAMENTO', subtitle: 'A experiência que criamos' },
  caixa: { number: '07', gradient: ['#9e7c0c', '#5a4607'], accent: '#b8860b', iconType: 'grain', tag: 'FINANCEIRO', subtitle: 'Responsabilidade financeira' },
  limpeza: { number: '08', gradient: ['#1e7e4e', '#0f4a2b'], accent: '#27ae60', iconType: 'wheat', tag: 'HIGIENE', subtitle: 'Ambiente que inspira' },
  'funcao-externa': { number: '09', gradient: ['#6c3483', '#3e1d4d'], accent: '#8e44ad', iconType: 'sprout', tag: 'EVENTOS', subtitle: 'Representando a Pralís' },
  'fornecedores-sociedade': { number: '10', gradient: ['#1a6e8a', '#0d3f50'], accent: '#2980b9', iconType: 'grain', tag: 'PARCERIAS', subtitle: 'Parcerias com propósito' },
  penalidades: { number: '11', gradient: ['#922b20', '#5e1a13'], accent: '#c0392b', iconType: 'flower', tag: 'DISCIPLINA', subtitle: 'Consequências e responsabilidade' },
  assinatura: { number: '12', gradient: ['#1e7e4e', '#b8860b'], accent: '#5dd87a', iconType: 'wheat', tag: 'CONCLUSÃO', subtitle: 'Você faz parte da família' },
}

/**
 * Garante a ordem pedagógica de cada módulo: o colaborador sempre vê o
 * conteúdo (texto) e um vídeo da Lis ANTES do quiz. Se o módulo não tiver
 * vídeo, injeta um placeholder logo antes do primeiro quiz.
 */
function ensureVideoBeforeQuiz(m: RawModule): RawModule['stories'] {
  const stories = m.stories
  const hasVideo = stories.some((s) => s.type === 'video')
  const quizAt = stories.findIndex((s) => s.type === 'quiz')
  if (hasVideo || quizAt < 0) return stories
  const placeholder = {
    type: 'video' as const,
    videoId: `${m.id}-video`,
    title: `Lis explica: ${m.title}`,
    description: 'um resumo rápido em vídeo',
    duration: '1:30',
  }
  return [...stories.slice(0, quizAt), placeholder, ...stories.slice(quizAt)]
}

function previousReviewIndex(stories: Story[], quizIndex: number) {
  for (let i = quizIndex - 1; i >= 0; i -= 1) {
    if (stories[i].type === 'text' || stories[i].type === 'summary') return i
  }
  return Math.max(0, quizIndex - 1)
}

function prepareStories(m: RawModule): Story[] {
  const stories = ensureVideoBeforeQuiz(m)

  return stories.map((story, index) => {
    if (story.type !== 'quiz') return story

    const reviewIndex = previousReviewIndex(stories, index)
    return {
      ...story,
      sampleSize: story.sampleSize ?? Math.min(3, story.questions.length),
      randomize: story.randomize ?? true,
      questions: story.questions.map((question) => ({
        ...question,
        reviewTarget: question.reviewTarget ?? {
          storyIndex: reviewIndex,
          label: 'Rever esse trecho',
        },
      })),
    }
  })
}

export const MODULES: Module[] = RAW_MODULES.map((m) => ({
  ...m,
  kind: m.kind ?? 'stories',
  stories: prepareStories(m),
  ...MODULE_META[m.id],
}))

// ---------- Helpers de seleção ----------

export const TERMS = [
  {
    id: 'compromisso',
    title: 'Termo de Compromisso',
    text: 'Comprometo-me a conhecer e cumprir integralmente o Código de Ética e Conduta da Pralís.',
  },
  {
    id: 'imagem',
    title: 'Termo de Uso de Nome, Voz e Imagem',
    text: 'Autorizo o uso de nome, voz e imagem nas comunicações da empresa, conforme o Código.',
  },
  {
    id: 'confidencialidade',
    title: 'Termo de Confidencialidade',
    text: 'Comprometo-me a manter sigilo sobre informações confidenciais, receitas e dados da empresa.',
  },
  {
    id: 'nao-aliciamento',
    title: 'Termo de Não Aliciamento',
    text: 'Comprometo-me a não aliciar clientes, fornecedores, parceiros ou colegas, durante e após o vínculo.',
  },
]

// Lê os módulos editados no Admin CMS (localStorage). Lê direto a chave para
// não criar dependência circular com adminStore.ts. Inativos são removidos.
const ADMIN_DATA_KEY = 'pralis_admin_data'
function applyRuntimeContentOverrides(module: Module): Module {
  if (module.id !== 'deveres' && module.id !== 'proibido') return module

  return {
    ...module,
    stories: module.stories.map((story, index) => {
      if (module.id === 'deveres') {
        if (index === 0 && story.type === 'lis') {
          return {
            ...story,
            videoSrc: '/lis-deverdetodos.webm',
            text: 'Agora vamos falar sobre os deveres que valem para TODO mundo aqui na Pralís. São o nosso combinado do dia a dia.',
          }
        }
        if (index === 1 && story.type === 'text') {
          return {
            ...story,
            audioSrc: '/audio-deveres-pontualidade-uniforme.mp3',
            audioIncludesTitle: false,
          }
        }
      }

      if (module.id === 'proibido' && index === 0 && story.type === 'lis') {
        return {
          ...story,
          videoSrc: '/lis-proibido.webm',
          text: 'Agora preciso da sua atenção TOTAL. Estas são as condutas terminantemente proibidas na Pralís, e o descumprimento tem consequências sérias.',
        }
      }

      return story
    }),
  }
}

function activeModules(): Module[] {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(ADMIN_DATA_KEY) : null
    if (raw) {
      const parsed = JSON.parse(raw) as { modules?: Module[] }
      if (Array.isArray(parsed.modules) && parsed.modules.length) {
        return parsed.modules
          .filter((m) => m.active !== false)
          .map((m) => ({
            ...m,
            stories: prepareStories(m),
          }))
          .map(applyRuntimeContentOverrides)
      }
    }
  } catch {
    /* fallback para o conteúdo padrão */
  }
  return MODULES.map(applyRuntimeContentOverrides)
}

/** Módulos visíveis para um cargo: gerais + os específicos do cargo. */
export function modulesForRole(role: string | null): Module[] {
  return activeModules().filter((m) => {
    if (m.roles === 'all') return true
    return role ? m.roles.includes(role as never) : false
  })
}

export function getModule(id: string): Module | undefined {
  return activeModules().find((m) => m.id === id)
}
