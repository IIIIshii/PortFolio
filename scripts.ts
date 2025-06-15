// スムーズスクロールの実装
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href')!);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// フォームのバリデーション
interface FormData {
    name: string;
    email: string;
    message: string;
}

const form = document.getElementById('contact-form') as HTMLFormElement;
if (form) {
    form.addEventListener('submit', async (e: Event) => {
        e.preventDefault();

        const formData: FormData = {
            name: (document.getElementById('name') as HTMLInputElement).value,
            email: (document.getElementById('email') as HTMLInputElement).value,
            message: (document.getElementById('message') as HTMLTextAreaElement).value
        };

        if (validateForm(formData)) {
            try {
                // ここにフォーム送信のロジックを実装
                console.log('フォームデータ:', formData);
                alert('お問い合わせありがとうございます。メッセージを送信しました。');
                form.reset();
            } catch (error) {
                console.error('エラーが発生しました:', error);
                alert('申し訳ありません。エラーが発生しました。もう一度お試しください。');
            }
        }
    });
}

function validateForm(data: FormData): boolean {
    let isValid = true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 名前のバリデーション
    if (!data.name.trim()) {
        showError('name', 'お名前を入力してください');
        isValid = false;
    } else {
        clearError('name');
    }

    // メールアドレスのバリデーション
    if (!data.email.trim()) {
        showError('email', 'メールアドレスを入力してください');
        isValid = false;
    } else if (!emailRegex.test(data.email)) {
        showError('email', '有効なメールアドレスを入力してください');
        isValid = false;
    } else {
        clearError('email');
    }

    // メッセージのバリデーション
    if (!data.message.trim()) {
        showError('message', 'メッセージを入力してください');
        isValid = false;
    } else if (data.message.length < 10) {
        showError('message', 'メッセージは10文字以上で入力してください');
        isValid = false;
    } else {
        clearError('message');
    }

    return isValid;
}

function showError(fieldId: string, message: string): void {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '0.875rem';
    errorDiv.style.marginTop = '0.25rem';

    const existingError = field?.parentElement?.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    field?.parentElement?.appendChild(errorDiv);
    field?.classList.add('error');
}

function clearError(fieldId: string): void {
    const field = document.getElementById(fieldId);
    const errorDiv = field?.parentElement?.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
    field?.classList.remove('error');
}

// スクロールアニメーション
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    section.classList.add('fade-out');
    observer.observe(section);
});

// スタイルの追加
const style = document.createElement('style');
style.textContent = `
    .fade-out {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease-out, transform 0.6s ease-out;
    }

    .fade-in {
        opacity: 1;
        transform: translateY(0);
    }

    .error {
        border-color: red !important;
    }

    .error-message {
        color: red;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
`;
document.head.appendChild(style); 