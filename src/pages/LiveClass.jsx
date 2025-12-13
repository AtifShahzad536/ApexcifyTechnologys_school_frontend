import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useSelector } from 'react-redux';
import { FaArrowLeft } from 'react-icons/fa';

const LiveClass = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state) => state.auth);
    const containerRef = useRef(null);
    const zpRef = useRef(null);

    useEffect(() => {
        const initMeeting = async () => {
            if (!containerRef.current || zpRef.current) return;

            const appID = Number(import.meta.env.VITE_ZEGO_APP_ID);
            const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET;

            // Generate Kit Token
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID,
                serverSecret,
                roomId,
                userInfo?._id || Date.now().toString(),
                userInfo?.name || "Guest"
            );

            // Create instance object from Kit Token
            const zp = ZegoUIKitPrebuilt.create(kitToken);
            zpRef.current = zp;

            // Start the call
            zp.joinRoom({
                container: containerRef.current,
                sharedLinks: [
                    {
                        name: 'Class Link',
                        url: window.location.href,
                    },
                ],
                scenario: {
                    mode: ZegoUIKitPrebuilt.GroupCall,
                },
                showScreenSharingButton: true,
                showUserList: true,
                showRoomDetailsButton: true,
                onLeaveRoom: () => {
                    navigate(-1);
                    window.location.reload(); // Force reload to clean up Zego state completely
                }
            });
        };

        initMeeting();

        // Cleanup function
        return () => {
            if (zpRef.current) {
                zpRef.current.destroy();
                zpRef.current = null;
            }
        };
    }, [roomId, userInfo, navigate]);

    return (
        <div className="flex flex-col h-full min-h-[calc(100vh-64px)] bg-gray-50">

            {/* Custom CSS to override Zego's Dark Theme */}
            <style>{`
                .ZEGO_uikit_prebuilt_video_view_container { background-color: #f9fafb !important; }
                .ZEGO_uikit_prebuilt_video_view_container > div { background-color: #f9fafb !important; }
                .ZEGO_uikit_prebuilt_container { background-color: #f9fafb !important; }
                .ZEGO_uikit_bottom_bar { background-color: white !important; box-shadow: 0 -2px 10px rgba(0,0,0,0.05) !important; border-top: 1px solid #eee !important; bottom: 0 !important; }
                /* Ensure video fits without cropping */
                video { object-fit: contain !important; }
            `}</style>

            {/* Header within the class frame */}
            <div className="bg-white px-6 py-2 border-b border-gray-200 flex justify-between items-center z-10 shrink-0">
                <div className="flex items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-3 p-2 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                        title="Leave Class"
                    >
                        <FaArrowLeft />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-gray-800">Live Classroom</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 font-mono hidden md:block">ID: {roomId}</span>
                    <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full animate-pulse flex items-center">
                        <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                        LIVE
                    </div>
                </div>
            </div>

            {/* Zego container */}
            <div
                className="flex-1 w-full bg-gray-50 relative [&_>_div]:!w-full [&_>_div]:!h-full [&_>_div]:!bg-gray-50"
                ref={containerRef}
            />
        </div>
    );
}

export default LiveClass;
