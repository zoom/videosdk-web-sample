const Views = {
    Preview: document.getElementById('js-preview-view'),
    Loading: document.getElementById('js-loading-view'),
    Session: document.getElementById('js-video-view'),
    End: document.getElementById('js-end-view'),
}

export const switchPreviewToLoadingView = () => {
    Views.Preview.classList.toggle('hidden');
    Views.Loading.classList.toggle('hidden');
};

export const switchLoadingToSessionView = () => {
    Views.Loading.classList.toggle('hidden');
    Views.Session.classList.toggle('hidden');
};

export const switchSessionToEndingView = () => {
    Views.Session.classList.toggle('hidden');
    Views.End.classList.toggle('hidden');
};