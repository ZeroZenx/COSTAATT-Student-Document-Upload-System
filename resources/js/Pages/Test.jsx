import AppLayout from '../Layouts/AppLayout';

export default function Test() {
    console.log('Test page loading...');
    
    return (
        <AppLayout>
            <div className="max-w-3xl mx-auto">
                <div className="card">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Test Page
                    </h1>
                    <p className="mt-4 text-gray-600">
                        If you can see this, the basic setup is working!
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
