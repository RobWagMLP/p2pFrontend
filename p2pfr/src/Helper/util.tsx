export const getIceServer = async ( ): Promise<[]>  => {
    const host =`${process.env.ICE_SERVER_REQ_HOST}credentials?apiKey=${process.env.ICE_SERVER_REQ_API_KEY}`
    const resp = await fetch(host);
    const result = await resp.json();

    return Promise.resolve(result);
}