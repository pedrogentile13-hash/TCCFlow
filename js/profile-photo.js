// TCCFlow Profile Photo Manager
// Gerencia upload, armazenamento e exibição de fotos de perfil

class ProfilePhotoManager {
    constructor() {
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const fileInput = document.getElementById('profilePhotoInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
        }

        const uploadBtn = document.getElementById('uploadPhotoBtn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                document.getElementById('profilePhotoInput').click();
            });
        }

        const removeBtn = document.getElementById('removePhotoBtn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeProfilePhoto());
        }
    }

    async handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validações
        if (!this.allowedTypes.includes(file.type)) {
            this.showPhotoMessage('Por favor, envie uma imagem em formato JPEG, PNG ou WebP.', 'error');
            return;
        }

        if (file.size > this.maxFileSize) {
            this.showPhotoMessage('Arquivo muito grande. Máximo de 5MB.', 'error');
            return;
        }

        try {
            const photoData = await this.compressAndConvertImage(file);
            await this.saveProfilePhoto(photoData);
            this.updatePhotoDisplay(photoData);
            this.showPhotoMessage('Foto de perfil atualizada com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao processar foto:', error);
            this.showPhotoMessage('Erro ao processar a foto. Tente novamente.', 'error');
        }
    }

    async compressAndConvertImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const maxDim = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > maxDim) {
                            height = (height * maxDim) / width;
                            width = maxDim;
                        }
                    } else {
                        if (height > maxDim) {
                            width = (width * maxDim) / height;
                            height = maxDim;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    resolve(canvas.toDataURL('image/webp', 0.8));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async saveProfilePhoto(photoData) {
        if (!window.currentUser) {
            console.log('Usuário não autenticado, salvando apenas localmente');
            preferences.setProfilePhoto(photoData);
            return;
        }

        try {
            if (isFirebaseConfigured() && typeof db !== 'undefined') {
                // Tentar salvar no Firebase
                await db.collection('users').doc(window.currentUser.uid).update({
                    profilePhoto: photoData,
                    photoUpdatedAt: new Date()
                });
            }
        } catch (error) {
            console.warn('Não foi possível salvar no Firebase, usando localStorage:', error);
        }

        // Sempre salvar localmente também
        preferences.setProfilePhoto(photoData);
    }

    async loadProfilePhoto() {
        if (window.currentUser) {
            try {
                if (isFirebaseConfigured() && typeof db !== 'undefined') {
                    const doc = await db.collection('users').doc(window.currentUser.uid).get();
                    if (doc.exists && doc.data().profilePhoto) {
                        return doc.data().profilePhoto;
                    }
                }
            } catch (error) {
                console.warn('Erro ao carregar foto do Firebase:', error);
            }
        }

        return preferences.getProfilePhoto();
    }

    updatePhotoDisplay(photoData) {
        const photoElements = document.querySelectorAll('.profile-photo-display, #profilePhoto, [data-profile-photo]');
        photoElements.forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = photoData;
            } else {
                el.style.backgroundImage = `url(${photoData})`;
                el.style.backgroundSize = 'cover';
                el.style.backgroundPosition = 'center';
            }
        });

        // Mostrar/esconder botão de remover
        const removeBtn = document.getElementById('removePhotoBtn');
        if (removeBtn) {
            removeBtn.classList.remove('hidden');
        }
    }

    removeProfilePhoto() {
        if (!confirm('Tem certeza que deseja remover sua foto de perfil?')) return;

        preferences.setProfilePhoto(null);
        this.resetPhotoDisplay();
        this.showPhotoMessage('Foto de perfil removida.', 'success');

        if (window.currentUser && isFirebaseConfigured() && typeof db !== 'undefined') {
            db.collection('users').doc(window.currentUser.uid).update({
                profilePhoto: null,
                photoUpdatedAt: new Date()
            }).catch(err => console.error('Erro ao remover foto:', err));
        }
    }

    resetPhotoDisplay() {
        const photoElements = document.querySelectorAll('.profile-photo-display, #profilePhoto, [data-profile-photo]');
        photoElements.forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = '';
            } else {
                el.style.backgroundImage = '';
                el.innerHTML = '<i class="fa-solid fa-user text-violet-600 text-2xl"></i>';
            }
        });

        const removeBtn = document.getElementById('removePhotoBtn');
        if (removeBtn) {
            removeBtn.classList.add('hidden');
        }
    }

    showPhotoMessage(message, type) {
        const msgEl = document.getElementById('photoMsg');
        if (!msgEl) return;

        msgEl.className = `text-sm rounded-xl px-4 py-3 ${type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-red-50 border border-red-200 text-red-700'}`;
        msgEl.textContent = message;
        msgEl.classList.remove('hidden');
        setTimeout(() => msgEl.classList.add('hidden'), 4000);
    }
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.profilePhotoManager = new ProfilePhotoManager();
    });
} else {
    window.profilePhotoManager = new ProfilePhotoManager();
}
