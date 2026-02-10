import React, { useState, useEffect } from 'react';
import { Download, X, AlertCircle } from 'lucide-react';
import packageJson from '../../package.json';

const GITHUB_USERNAME = 'hemoIQ';
const REPO_NAME = 'Hemo-exercises';
const BRANCH = 'main';

const UpdateNotification = () => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [latestVersion, setLatestVersion] = useState(null);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkforUpdates = async () => {
            try {
                // Fetch package.json from the main branch
                const response = await fetch(`https://raw.githubusercontent.com/${GITHUB_USERNAME}/${REPO_NAME}/${BRANCH}/package.json`);
                if (!response.ok) return;

                const data = await response.json();
                const remoteVersion = data.version;
                const localVersion = packageJson.version;

                if (compareVersions(remoteVersion, localVersion) > 0) {
                    setLatestVersion(remoteVersion);
                    setUpdateAvailable(true);
                    setIsVisible(true);
                    // Set the download URL to the latest release page (or a specific APK asset if predictable)
                    setDownloadUrl(`https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/releases/latest`);
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
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);

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
        <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-2xl p-4 z-50 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-start justify-between">
                <div className="flex gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                        <Download className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">تحديث جديد متوفر!</h3>
                        <p className="text-zinc-400 text-xs mt-1">نسخة {latestVersion} متاحة الآن. قم بالتحديث للحصول على آخر الميزات.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block w-full bg-indigo-600 hover:bg-indigo-500 text-white text-center py-2.5 rounded-xl font-bold text-sm transition-colors"
            >
                تحميل التحديث
            </a>
        </div>
    );
};

export default UpdateNotification;
