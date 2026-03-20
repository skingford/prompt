export const DEFAULT_LANGUAGE = "zh-CN";
export const LOCALE_STORAGE_KEY = "promptopt.locale";

export const LOCALE_OPTIONS = [
  { code: "zh-CN", label: "中文" },
  { code: "en", label: "English" },
] as const;

export const resources = {
  "zh-CN": {
    common: {
      brand: {
        short: "PromptOpt",
        full: "Prompt Optimization Tool",
        prototype: "PromptOpt 原型",
      },
      language: "语言",
      locales: {
        "zh-CN": "中文",
        en: "English",
      },
      theme: {
        switchToDark: "切换到深色模式",
        switchToLight: "切换到浅色模式",
      },
      accountMenu: "打开账户菜单",
      account: "账户",
      logout: "退出登录",
      resizePanels: "调整面板宽度",
      modelSelector: "模型选择",
      notConfigured: "未配置",
    },
    login: {
      pageTitle: "登录 - PromptOpt",
      title: "Prompt Optimization Tool",
      subtitle: "更精准地优化你的 AI 提示词交互",
      fields: {
        username: "用户名",
        password: "密码",
      },
      placeholders: {
        username: "请输入用户名",
        password: "••••••••",
      },
      forgotPassword: "忘记密码？",
      submit: "登录",
      submitLoading: "登录中...",
      signupLead: "还没有账号？",
      signupAction: "免费注册",
      footer: {
        privacy: "隐私政策",
        terms: "服务条款",
        support: "支持",
        copyright: "© 2023 Prompt Optimization Tool。保留所有权利。",
      },
      errors: {
        missingCredentials: "请输入用户名和密码后继续。",
        signInFailed: "登录失败，请稍后重试。",
      },
    },
    workbench: {
      pageTitle: {
        diagnostics: "诊断工作台 - PromptOpt",
        comparison: "对比工作台 - PromptOpt",
      },
      topbar: {
        subtitle: "工作台",
        navAria: "工作台分区",
        nav: {
          project: "项目",
          workbench: "工作台",
          history: "历史记录",
        },
      },
      prompt: {
        editorTitle: "提示词编辑器",
        currentTitle: "当前提示词",
        diagnosticsPlaceholder: "在此输入你的提示词...",
        comparisonPlaceholder: "在此输入当前提示词...",
        charCount: "{{count}} 个字符",
        comparisonCharCount: "字符数: {{count}}",
      },
      tabs: {
        diagnostics: "诊断",
        versionLabel: "版本 {{count}}",
        closeVersion: "关闭 {{label}}",
      },
      actions: {
        diagnose: "诊断",
        diagnosing: "诊断中...",
        optimize: "优化",
        optimizing: "优化中...",
        optimizeFromDiagnostics: "根据诊断结果优化",
        adopt: "采用",
        copy: "复制",
        copied: "已复制",
        compare: "对比",
        preview: "预览",
        exitComparison: "退出对比",
      },
      states: {
        suggestion: "建议",
        noVersionTitle: "未选中版本",
        noVersionBody: "请先生成新的优化版本，或重新打开一个已有标签。",
        ready: "就绪",
        systemOnline: "系统在线",
      },
      menu: {
        language: "语言",
      },
      toasts: {
        closeOlderVersion: "请先关闭旧版本标签，再创建新的版本。",
        versionCopiedToEditor: "已将 {{label}} 填回编辑器。",
        copiedToClipboard: "已复制 {{label}} 到剪贴板。",
        adoptedToCurrentPrompt: "已将 {{label}} 应用到当前提示词。",
      },
      badges: {
        vague: "模糊",
        unclear: "不清晰",
        optimization: "可优化",
        missing: "缺失",
      },
      mock: {
        defaultDiagnosticsPrompt: "请你作为资深分析顾问审阅这份文档，指出其中的问题，并说明如何调整结构，让它更适合下周向利益相关方做专业汇报。",
        defaultComparisonPrompt: "请你作为经验丰富的旅行顾问，为我规划一趟 10 月去东京的 5 日行程。重点安排寿司和历史神社，估算每天的花费，并说明 JR Pass 是否值得购买。同时保持语气专业但友好，并推荐新宿区域的酒店。",
        defaultDiagnosticsIssues: {
          audience: {
            label: "模糊",
            title: "目标受众定义",
            description: "提示词提到了“利益相关方汇报”，但没有说明这些对象的技术背景和关注重点。",
            suggestion: "“请明确这些利益相关方是高管、技术负责人还是业务管理者。”",
          },
          scope: {
            label: "不清晰",
            title: "“审阅”范围不明确",
            description: "“指出哪里有问题”这个要求过于宽泛。模型可能会只关注语法，而你实际更关心结构和策略。",
            suggestion: "“请明确审阅维度，例如逻辑结构、数据准确性或视觉排版。”",
          },
          constraint: {
            label: "可优化",
            title: "约束条件表达",
            description: "“下周要汇报”传递了时间压力，但没有转化为模型可执行的输出要求。",
            suggestion: "“请要求输出为 checklist 或按页面拆分的结构化提纲。”",
          },
        },
        defaultDiagnosticsVersions: {
          v1: "请你作为面向高管和跨职能负责人的资深沟通策略顾问，审阅这份利益相关方汇报材料。识别结构、叙事推进和证据支撑中的问题，说明这些问题为什么会削弱管理层信心，并给出更清晰、更专业的重组建议。请最终以逐页检查清单的形式返回修改建议。",
          v2: "请你作为汇报材料顾问来评估这份文档是否适合面向利益相关方进行正式沟通。重点检查其是否符合高层阅读逻辑，指出过渡不清、证据不足以及过于战术化的部分，并给出新的汇报结构建议。请按照：关键问题、影响、结构修正 的格式输出。",
          v3: "请你作为高管汇报教练，审阅这份文档是否适合利益相关方正式沟通。请重点判断叙事主线是否清晰、信息优先级是否合理，以及每一部分是否支撑决策。指出结构缺陷，给出更强的叙事顺序，并输出一个可直接用于重建汇报材料的专业化提纲。",
          v4: "请你作为高管级演示顾问，评估这份文档是否已经适合面向利益相关方正式呈现。重点判断故事线是否清晰、洞察优先级是否合理，以及每一部分是否真正支撑决策。请指出结构薄弱处，重排更有说服力的叙事顺序，并输出一份可直接用于重建演示文稿的专业提纲。",
        },
        defaultComparisonVersions: {
          v1: "请你作为专门负责东京路线规划的旅行顾问，为我设计一份 10 月下旬（红叶季）的 5 日东京深度行程。\n\n请重点安排正宗江户前寿司体验和有代表性的神社参访，并估算每天花费，同时分析 JR Pass 与 Suica 交通方案的性价比。\n\n整体语气保持专业但有感染力，并推荐位于新宿和涩谷区域的高品质酒店。",
          v2: "请你作为高端日本行程设计顾问，为 10 月最后一周的东京之旅制定一份 5 日计划，兼顾精品寿司、历史神社与高效的城市动线。\n\n请按早晨、下午、夜晚拆分每日行程，估算预算，并判断更适合使用 JR Pass 还是充值 Suica 卡。\n\n整体语气要温暖、精致且像礼宾服务，并推荐新宿、涩谷和银座的优质酒店。",
          v3: "请你作为东京目的地专家，为首次前往日本的高端旅行者制定一份 10 月底的 5 日行程。请平衡历史神社、精品寿司、夜间散步路线与现实可行的交通选择。补充每日预算、酒店建议，以及何时适合买 JR Pass、何时直接使用 Suica 更省心。整体呈现要精炼、专业，并方便快速做预订决策。",
          v4: "请你作为东京目的地策划专家，为首次赴日的高端旅行者制定一份 10 月底的 5 日行程，结合文化景点、精致寿司体验、夜间街区漫步与现实可行的交通安排。请补充每日预算、交通建议、酒店推荐，并判断何时购买交通通票更划算、何时直接使用 Suica 更省心。整体结构要精炼、高级且便于快速完成预订决策。",
        },
        generatedIssues: {
          audience: {
            label: "缺失",
            title: "受众上下文",
            description: "提示词没有说明输出应该为谁优化，容易导致结果层级和细节不匹配。",
            suggestion: "“请明确最终读者或决策者是谁，以便控制细节深度和表达语气。”",
          },
          format: {
            label: "不清晰",
            title: "输出形式",
            description: "请求说明了目标，但没有约束输出结构，结果可能不利于阅读和复用。",
            suggestion: "“请指定输出格式，例如 checklist、提纲或分节建议。”",
          },
          timing: {
            label: "可优化",
            title: "时间信号",
            description: "提到了时间压力，但没有把它转化为更适合汇报场景的具体输出要求。",
            suggestion: "“把紧迫性改写为明确的交付格式，例如先给高层摘要，再给逐节修改建议。”",
          },
          tone: {
            label: "模糊",
            title: "语气要求",
            description: "提示词没有定义答案应该多正式、多强势或多友好。",
            suggestion: "“请补充期望语气，让输出风格与最终受众一致。”",
          },
          refinement: {
            label: "可优化",
            title: "进一步细化",
            description: "这个提示词已经可以工作，但仍然可以通过补充约束和成功标准来提高稳定性。",
            suggestion: "“增加验收标准、输出分节和受众上下文，让结果更稳定。”",
          },
        },
        genericOptimization: {
          line1: "请你作为资深提示词策略顾问。",
          line2: "请将下面的请求重写为更适合 {{audience}} 的版本。",
          line3: "请明确目标、约束、语气和输出结构。",
          line4: "只返回润色后的最终提示词，不要额外解释。",
          original: "原始请求：{{prompt}}",
        },
      },
    },
  },
  en: {
    common: {
      brand: {
        short: "PromptOpt",
        full: "Prompt Optimization Tool",
        prototype: "PromptOpt Prototype",
      },
      language: "Language",
      locales: {
        "zh-CN": "Chinese",
        en: "English",
      },
      theme: {
        switchToDark: "Switch to dark mode",
        switchToLight: "Switch to light mode",
      },
      accountMenu: "Open account menu",
      account: "Account",
      logout: "Log out",
      resizePanels: "Resize panels",
      modelSelector: "Model selector",
      notConfigured: "Not configured",
    },
    login: {
      pageTitle: "Login - PromptOpt",
      title: "Prompt Optimization Tool",
      subtitle: "Refine your AI interactions with precision",
      fields: {
        username: "Username",
        password: "Password",
      },
      placeholders: {
        username: "Enter your username",
        password: "••••••••",
      },
      forgotPassword: "Forgot password?",
      submit: "Login",
      submitLoading: "Signing in...",
      signupLead: "Don't have an account?",
      signupAction: "Sign up for free",
      footer: {
        privacy: "Privacy Policy",
        terms: "Terms of Service",
        support: "Support",
        copyright: "© 2023 Prompt Optimization Tool. All rights reserved.",
      },
      errors: {
        missingCredentials: "Enter both username and password to continue.",
        signInFailed: "We could not sign you in. Please try again.",
      },
    },
    workbench: {
      pageTitle: {
        diagnostics: "Diagnostics Workbench - PromptOpt",
        comparison: "Comparison Workbench - PromptOpt",
      },
      topbar: {
        subtitle: "Workbench",
        navAria: "Workbench sections",
        nav: {
          project: "Project",
          workbench: "Workbench",
          history: "History",
        },
      },
      prompt: {
        editorTitle: "Prompt Editor",
        currentTitle: "Current Prompt",
        diagnosticsPlaceholder: "Enter your prompt here...",
        comparisonPlaceholder: "Enter your current prompt here...",
        charCount: "{{count}} characters",
        comparisonCharCount: "Characters: {{count}}",
      },
      tabs: {
        diagnostics: "Diagnostics",
        versionLabel: "Version {{count}}",
        closeVersion: "Close {{label}}",
      },
      actions: {
        diagnose: "Diagnose",
        diagnosing: "Diagnosing...",
        optimize: "Optimize",
        optimizing: "Optimizing...",
        optimizeFromDiagnostics: "Optimize based on diagnostics",
        adopt: "Adopt",
        copy: "Copy",
        copied: "Copied",
        compare: "Compare",
        preview: "Preview",
        exitComparison: "Exit Comparison",
      },
      states: {
        suggestion: "Suggestion",
        noVersionTitle: "No version selected",
        noVersionBody: "Generate a new optimized version or reopen an existing tab.",
        ready: "Ready",
        systemOnline: "System Online",
      },
      menu: {
        language: "Language",
      },
      toasts: {
        closeOlderVersion: "Close an older version tab before creating another one.",
        versionCopiedToEditor: "{{label}} copied into the editor.",
        copiedToClipboard: "{{label}} copied to clipboard.",
        adoptedToCurrentPrompt: "{{label}} adopted into the current prompt.",
      },
      badges: {
        vague: "Vague",
        unclear: "Unclear",
        optimization: "Optimization",
        missing: "Missing",
      },
      mock: {
        defaultDiagnosticsPrompt: "Act as an expert analyst and review this document. Tell me what is wrong with it and how to fix the structure so it is more professional for a stakeholder presentation next week.",
        defaultComparisonPrompt: "Act as a helpful travel agent. I want to plan a 5-day trip to Tokyo in October. Provide a detailed itinerary focusing on sushi and historical shrines. Include estimated costs for each day and advice on using the JR pass. Ensure the tone is professional yet welcoming. I also need suggestions for hotels in Shinjuku area.",
        defaultDiagnosticsIssues: {
          audience: {
            label: "Vague",
            title: "Target Audience Definition",
            description: "The prompt mentions \"stakeholder presentation\" but doesn't specify the level of technical knowledge or specific interests of these stakeholders.",
            suggestion: "\"Explicitly state if the stakeholders are C-suite executives, technical leads, or general management.\"",
          },
          scope: {
            label: "Unclear",
            title: "Scope of \"Review\"",
            description: "\"Tell me what is wrong\" is a broad directive. The AI might focus on grammar when you need strategy, or vice versa.",
            suggestion: "\"Specify dimensions for review: logical flow, data accuracy, or visual layout.\"",
          },
          constraint: {
            label: "Optimization",
            title: "Constraint Specification",
            description: "The time constraint \"next week\" is irrelevant to the model but implies urgency that could be better handled by formatting requests.",
            suggestion: "\"Request the output in a checklist format or a structured slide-by-slide outline.\"",
          },
        },
        defaultDiagnosticsVersions: {
          v1: "Act as a senior communications strategist reviewing a stakeholder presentation for executive sponsors and cross-functional leads. Identify weaknesses in the document's structure, narrative flow, and level of evidence. Explain what is not working, why it reduces executive confidence, and how to reorganize the content for a clearer, more professional presentation. Return your review as a slide-by-slide checklist with practical revisions.",
          v2: "Review this document as a presentation advisor preparing material for a stakeholder readout. Evaluate whether the deck is logically structured for senior leadership, highlight unclear transitions, missing evidence, and any sections that feel too tactical, then recommend a revised outline. Format the response with: key issues, strategic impact, and exact structural fixes for each section.",
          v3: "Act as an executive presentation coach and review whether this document is ready for formal stakeholder communication. Evaluate whether the narrative spine is clear, the information hierarchy is sound, and each section meaningfully supports decision-making. Identify structural flaws, recommend a stronger narrative order, and produce a professional outline that can be used to rebuild the presentation.",
          v4: "You are an executive presentation coach. Analyze this document for stakeholder readiness, focusing on clarity of storyline, prioritization of insights, and whether each section supports an informed decision. Point out structural weaknesses, recommend a stronger narrative sequence, and provide a professional outline that could be used to rebuild the presentation.",
        },
        defaultComparisonVersions: {
          v1: "Act as a specialized Tokyo travel consultant. I want to plan a comprehensive 5-day itinerary for Tokyo in late October (Autumn foliage peak).\n\nProvide a detailed itinerary focusing on authentic Edomae-style sushi experiences and significant Shinto shrines. Include estimated costs for each day and a cost-benefit analysis of the JR Pass vs. Suica cards.\n\nEnsure the tone is professional yet enthusiastic. I also need luxury and boutique hotel suggestions specifically within the Shinjuku and Shibuya districts.",
          v2: "Act as an upscale Japan itinerary designer. Build a five-day Tokyo plan for the final week of October with a balanced mix of premium sushi counters, historic shrine visits, and efficient neighborhood routing.\n\nBreak each day into morning, afternoon, and evening segments, estimate costs, and recommend whether the traveler should rely on JR Pass coverage or recharge a Suica card.\n\nKeep the tone warm, polished, and concierge-like, and recommend standout hotels in Shinjuku, Shibuya, and Ginza.",
          v3: "Act as a Tokyo destination expert for a first-time premium traveler visiting Japan in late October. Design a five-day itinerary that balances historic shrines, refined sushi experiences, evening walking routes, and realistic transportation choices. Add daily budgets, hotel suggestions, and clear advice on when a JR Pass is worth it versus when using Suica is the easier option. Keep the plan concise, polished, and easy to book from.",
          v4: "Act as a Tokyo destination specialist for a first-time premium traveler. Create a five-day late-October itinerary that blends heritage shrines, refined sushi experiences, evening neighborhood walks, and realistic transportation choices. Include daily budgets, hotel suggestions in well-connected districts, and practical advice on when a transit pass is worthwhile versus when IC-card travel is simpler. Keep the structure concise, premium, and easy to scan for a traveler making quick booking decisions.",
        },
        generatedIssues: {
          audience: {
            label: "Missing",
            title: "Audience Context",
            description: "The prompt does not make clear who the answer should be optimized for, which can lead to the wrong level of detail.",
            suggestion: "\"State the intended reader or decision-maker so the output can target the right level of detail and tone.\"",
          },
          format: {
            label: "Unclear",
            title: "Output Shape",
            description: "The request describes the goal but not the shape of the deliverable, so the result may be hard to scan or reuse.",
            suggestion: "\"Specify the response format, for example a checklist, outline, or sectioned recommendation.\"",
          },
          timing: {
            label: "Optimization",
            title: "Timing Signal",
            description: "Time pressure is mentioned, but it is not translated into a presentation-friendly output requirement.",
            suggestion: "\"Replace urgency cues with concrete delivery requirements such as executive summary first, then section-by-section fixes.\"",
          },
          tone: {
            label: "Vague",
            title: "Tone Requirements",
            description: "The prompt does not define how polished or assertive the answer should sound.",
            suggestion: "\"Clarify the desired tone so the response style matches the final audience.\"",
          },
          refinement: {
            label: "Optimization",
            title: "Further Refinement",
            description: "The prompt is workable, but it can still benefit from more explicit constraints and success criteria.",
            suggestion: "\"Add acceptance criteria, output sections, and audience context to make the result more reliable.\"",
          },
        },
        genericOptimization: {
          line1: "Act as a senior prompt strategist.",
          line2: "Rewrite the request so it is optimized for the {{audience}}.",
          line3: "Clarify the objective, constraints, desired tone, and exact output structure.",
          line4: "Return only the final rewritten prompt as polished plain text.",
          original: "Original request: {{prompt}}",
        },
      },
    },
  },
} as const;

export type AppLocale = (typeof LOCALE_OPTIONS)[number]["code"];
