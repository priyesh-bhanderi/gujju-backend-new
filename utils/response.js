export const sendResponse = (res, message, success, payload) => {
    if (success) {
        return res.status(200).json({
            message: message,
            status: true,
            data: payload,
        });
    } else {
        return res.status(400).json({
            status: false,
            error_message: message,
        });
    }
};