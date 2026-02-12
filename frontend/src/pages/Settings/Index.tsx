import AppLayout from '@/layouts/AppLayout';
import AudioInputSettings from '@/components/AudioInputSettings';

export default function SettingsIndex() {
    return (
        <AppLayout>
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-2xl mx-auto p-6 space-y-8">
                    <h1 className="text-2xl font-bold text-white">Settings</h1>
                    <AudioInputSettings />
                </div>
            </div>
        </AppLayout>
    );
}
