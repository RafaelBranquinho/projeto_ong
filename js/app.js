document.addEventListener('DOMContentLoaded', () => {

    // Elementos principais da "casca"
    const appRoot = document.getElementById('app-root');
    const navMenu = document.querySelector('.nav-menu');
    const navToggle = document.querySelector('.nav-toggle');

    // ===================================================================
    // 1. REQUISITO: Sistema de SPA (Single Page Application) Básico
    // ===================================================================

    // Mapeia o 'data-page' (do link) para o arquivo HTML (o "template")
    const routes = {
        'inicio': 'pages/inicio.html',
        'projetos': 'pages/projetos.html',
        'cadastro': 'pages/cadastro.html',
        'contato': null // 'contato' é um link de âncora especial
    };

    /**
     * Carrega o conteúdo da página (template) via fetch
     */
    async function loadPage(page) {
        if (page === 'contato') {
            document.getElementById('contato').scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const path = routes[page];
        if (!path) {
            console.error(`Rota não encontrada: ${page}`);
            loadPage('inicio'); 
            return;
        }

        try {
            const response = await fetch(path);
            if (!response.ok) throw new Error('Falha ao carregar a página.');
            
            const html = await response.text();
            appRoot.innerHTML = html;
            
            // Executa scripts específicos para a página que acabamos de carregar
            executePageScripts(page);
            
            updateActiveLink(page);
            
            if (navMenu.classList.contains('is-active')) {
                navMenu.classList.remove('is-active');
                navToggle.classList.remove('is-active');
                // Corrigido: Atualiza ARIA no fechamento
                navToggle.setAttribute('aria-expanded', false); 
            }

        } catch (error) {
            console.error('Erro ao carregar página:', error);
            appRoot.innerHTML = '<div class="container"><p>Erro ao carregar o conteúdo. Tente novamente.</p></div>';
        }
    }

    /**
     * Atualiza qual link está com a classe 'active' no menu
     */
    function updateActiveLink(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Lida com cliques nos links da navegação
     */
    function handleNavClick(event) {
        const targetLink = event.target.closest('.nav-link');
        
        if (targetLink) {
            event.preventDefault(); 
            const page = targetLink.dataset.page;
            
            if (page !== 'contato') {
                window.location.hash = page;
            } else {
                loadPage('contato'); 
            }
        }
    }

    /**
     * Lida com a mudança de hash na URL (ex: F5, link direto, botão "voltar")
     */
    function handleHashChange() {
        const page = window.location.hash.substring(1) || 'inicio';
        
        if (routes[page] !== undefined) {
            loadPage(page);
        } else {
            loadPage('inicio'); 
        }
    }

    // ===================================================================
    // 2. REQUISITO: Sistema de "Templates" e Validação
    // ===================================================================

    function executePageScripts(page) {
        if (page === 'cadastro') {
            initCadastroPage();
        }
    }

    function initCadastroPage() {
        const form = document.getElementById('cadastro-form');
        if (!form) return; 

        try {
            IMask(document.getElementById('cep'), { mask: '00000-000' });
            IMask(document.getElementById('cpf'), { mask: '000.000.000-00' });
            IMask(document.getElementById('telefone'), {
                mask: [
                    { mask: '(00) 0000-0000' },
                    { mask: '(00) 00000-0000' }
                ]
            });
        } catch (e) {
            console.warn("IMask.js não foi carregado ou falhou.", e);
        }

        form.addEventListener('submit', function(event) {
            event.preventDefault();
            if (validateForm(form)) {
                alert('Formulário enviado com sucesso! (Simulação)');
                form.reset();
                form.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));
            } else {
                alert('Por favor, corrija os erros no formulário.');
            }
        });
    }

    function validateForm(form) {
        let isFormValid = true;
        const inputs = form.querySelectorAll('[required]'); 

        inputs.forEach(input => {
            input.classList.remove('is-valid', 'is-invalid');
            if (input.checkValidity()) {
                input.classList.add('is-valid');
            } else {
                input.classList.add('is-invalid');
                isFormValid = false; 
            }
        });

        return isFormValid;
    }


    // ===================================================================
    // 2.5 REQUISITO: Modo Escuro (Acessibilidade - Entrega IV)
    // ===================================================================
    
    // Esta função é definida aqui
    function initThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        
        if (!themeToggle) {
            console.error("Botão 'theme-toggle' não encontrado!"); // Segurança
            return; 
        }

        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.body.classList.add('dark-mode');
                themeToggle.setAttribute('aria-label', 'Alternar modo claro');
            } else {
                document.body.classList.remove('dark-mode');
                themeToggle.setAttribute('aria-label', 'Alternar modo escuro');
            }
        };

        let currentTheme = localStorage.getItem('theme') || 'light';
        applyTheme(currentTheme);

        themeToggle.addEventListener('click', () => {
            currentTheme = (currentTheme === 'light') ? 'dark' : 'light';
            localStorage.setItem('theme', currentTheme); 
            applyTheme(currentTheme);
        });
    }

    // ===================================================================
    // 3. INICIALIZAÇÃO (Onde tudo é "ligado")
    // ===================================================================
    
    // Adiciona o listener para o menu hambúrguer (COM ARIA)
    navToggle.addEventListener('click', () => {
        const isActive = navMenu.classList.toggle('is-active'); 
        navToggle.classList.toggle('is-active');
        navToggle.setAttribute('aria-expanded', isActive);
    });

    // Adiciona o listener para os cliques na navegação (para o roteador)
    document.querySelector('.main-header').addEventListener('click', handleNavClick);
    
    // Adiciona o listener para mudanças de hash (F5, voltar, etc.)
    window.addEventListener('hashchange', handleHashChange);

    // CHAMA a função para ligar o botão de tema
    initThemeToggle();

    // Carrega a página inicial (ou a página do hash)
    handleHashChange();
    
}); // Fim do 'DOMContentLoaded'