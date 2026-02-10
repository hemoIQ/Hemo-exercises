import React, { useState, useEffect } from 'react';
import { Download, X, AlertCircle, Gift } from 'lucide-react';
import packageJson from '../../package.json';

const GITHUB_USERNAME = 'hemoIQ';
const REPO_NAME = 'Hemo-exercises';

const UpdateNotification = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [latestVersion, setLatestVersion] = useState(null);
    const [releasenotes, setReleaseNotes] = useState('');
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkforUpdates = async () => {
            try {
                // Fetch latest release from GitHub API
                const response = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/releases/latest`);

                if (!response.ok) return;

                const data = await response.json();
                const tagName = data.tag_name; // e.g., "v1.2.0"
                const remoteVersion = tagName.replace(/^v/, ''); // Remove 'v' prefix
                const localVersion = packageJson.version;

                if (compareVersions(remoteVersion, localVersion) > 0) {
                    setLatestVersion(remoteVersion);
                    setReleaseNotes(data.body || '');

                    // Find the APK asset
                    const apkAsset = data.assets.find(asset => asset.name.endsWith('.apk'));
                    // Fallback to release page if APK asset not found
                    setDownloadUrl(apkAsset ? apkAsset.browser_download_url : data.html_url);

                    setUpdateAvailable(true);
                    setIsVisible(true);
                }
            } catch (error) {
                console.error("Error checking for updates:", error);
                // Fail silently - app should work offline
            }
        };

        checkforUpdates();
    }, []);

    const compareVersions = (v1, v2) => {
        if (!v1 || !v2) return 0;
        const parts1 = v1.split('.').map(num => parseInt(num, 10));
        const parts2 = v2.split('.').map(num => parseInt(num, 10));

        for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
            const p1 = parts1[i] || 0;
            const p2 = parts2[i] || 0;
            if (p1 > p2) return 1;
            if (p1 < p2) return -1;
        }
        return 0;
    };

    if (!updateAvailable || !isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setIsVisible(false)} />

            <div className="bg-zinc-900 border border-zinc-700 shadow-2xl rounded-[2rem] p-6 w-full max-w-md pointer-events-auto relative animate-in slide-in-from-bottom duration-500 overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -z-10"></div>

                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/20">
                            <Gift className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-white">تحديث جديد!</h3>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-wider">الإصدار {latestVersion}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6 bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50 max-h-32 overflow-y-auto custom-scrollbar">
                    <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {releasenotes || "تحديثات جديدة لتحسين الأداء وإضافة ميزات جديدة."}
                    </p>
                </div>

                <div className="flex gap-3">
                    <a
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-center py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all active:scale-95"
                    >
                        <Download className="w-5 h-5" />
                        تحميل التحديث
                    </a>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="px-5 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-bold transition-all active:scale-95"
                    >
                        لاحقاً
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateNotification;
