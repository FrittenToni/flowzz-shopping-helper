// src/lib/syncStrains.ts

interface ImageFormats {
    small: {
        url: string;
    };
    thumbnail: {
        url: string;
    };
}

interface ImageAttributes {
    alternative_text: string;
    width: number;
    height: number;
    mime: string;
    url: string;
    formats: ImageFormats;
}

interface ImageData {
    data: {
        id: number;
        attributes: ImageAttributes;
    };
}

interface Product {
    id: number;
    url: string;
    producer: string | null;
    name: string;
    thc: number;
    cbd: number;
    genetic: string;
    irradiated: boolean;
    origin: string;
    created_at: string;
    updated_at: string;
    published_at: string;
    created_by_id: number;
    updated_by_id: number;
    locale: string;
    description: string | null;
    strain_name: string;
    producer_name: string;
    ratings_score: number;
    ratings_count: number;
    min_price: number;
    max_price: number;
    availibility: number;
    image: ImageData | null;
}

interface Pagination {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
}

interface ApiResponse {
    data: {
        data: Product[];
        meta: {
            pagination: Pagination;
        };
    };
    error: boolean;
}

interface Vendor {
    id: string;
    attributes: {
        price: number;
        availibility: number;
        url: string | null;
        vendor: {
            data: {
                id: string;
                attributes: {
                    name: string;
                    website: string;
                    cannaleo_partner: string | null;
                };
            };
        };
    };
}

interface VendorApiResponse {
    message: {
        data: {
            priceFlowers: {
                data: Vendor[];
            };
            lastPriceUpdate: string;
        };
    };
    error: boolean;
}

async function fetchWithRetries(url, delay, retries = 10, attempt = 1) {
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        if (attempt < retries) {
            const nextDelay = delay * 2; // Exponential backoff
            console.warn(`Retrying ${url} (attempt ${attempt}) in ${nextDelay}ms due to error: ${error.message}`);
            return fetchWithRetries(url, nextDelay, retries, attempt + 1);
        } else {
            console.error(`Failed to fetch ${url} after ${retries} attempts.`);
            throw error;
        }
    }
}

export async function fetchStrains(updateMessage: (message: string) => void): Promise<void> {
    let allStrains: Product[] = [];
    const page = 1;
    const pageSize = 30; // Should match the API's page size

    updateMessage('Syncing Cannabis Strains...');

    try {
        await new Promise(r => setTimeout(r, 2000));

        // Fetch the first page
        const initialData: ApiResponse = await fetchWithRetries(
            `https://flowzz.com/api/v1/views/flowers?pagination[page]=${page}&pagination[pageSize]=${pageSize}&avail=0`, 
            200
        );

        if (initialData.error) throw new Error('API error');

        if (initialData.data?.data?.length > 0) {
            allStrains = [...initialData.data.data];
            const totalPages = initialData.data.meta.pagination.pageCount;
            const fetchPromises = [];

            // Fetch remaining pages with retry and backoff
            for (let i = 2; i <= totalPages; i++) {
                const url = `https://flowzz.com/api/v1/views/flowers?pagination[page]=${i}&pagination[pageSize]=${pageSize}&avail=0`;
                fetchPromises.push(fetchWithRetries(url, 200)); 
            }

            const results = await Promise.all(fetchPromises);
            results.forEach((data: ApiResponse) => {
                if (data.data?.data?.length > 0) {
                    allStrains = [...allStrains, ...data.data.data];
                }
            });
        } 

        // Save the strains to local storage
        localStorage.setItem('cannabisStrains', JSON.stringify(allStrains));
        updateMessage(`${allStrains.length} Cannabis Strains available`);

    } catch (error) {
        console.error('Error fetching cannabis strains:', error);
        updateMessage('Failed to retrieve cannabis strains.');
    }
}


export async function fetchVendorsForStrain(strainId: number): Promise<VendorApiResponse | null> {
    try {
        const response = await fetch(`https://flowzz.com/api/vendor?t=2&id=${strainId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: VendorApiResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}